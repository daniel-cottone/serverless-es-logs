import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';

import { LambdaPermissionBuilder, SubscriptionFilterBuilder, TemplateBuilder } from './utils';

// tslint:disable:no-var-requires
const iamLambdaTemplate = require('../templates/iam/lambda-role.json');
const withXrayTracingPermissions = require('../templates/iam/withXrayTracingPermissions.js');
// tslint:enable:no-var-requires

class ServerlessEsLogsPlugin {
  public hooks: { [name: string]: () => void };
  private provider: any;
  private serverless: any;
  private options: { [name: string]: any };
  private logProcesserDir: string = '_es-logs';
  private logProcesserName: string = 'esLogsProcesser';
  private logProcesserLogicalId: string;
  private defaultLambdaFilterPattern: string = '[timestamp=*Z, request_id="*-*", event]';
  private defaultApiGWFilterPattern: string = '[event]';

  constructor(serverless: any, options: { [name: string]: any }) {
    this.serverless = serverless;
    this.provider = serverless.getProvider('aws');
    this.options = options;
    const normalizedName = this.provider.naming.getNormalizedFunctionName(this.logProcesserName);
    this.logProcesserLogicalId = `${normalizedName}LambdaFunction`;
    // tslint:disable:object-literal-sort-keys
    this.hooks = {
      'after:package:initialize': this.afterPackageInitialize.bind(this),
      'after:package:createDeploymentArtifacts': this.afterPackageCreateDeploymentArtifacts.bind(this),
      'aws:package:finalize:mergeCustomProviderResources': this.mergeCustomProviderResources.bind(this),
    };
    // tslint:enable:object-literal-sort-keys
  }

  private custom(): { [name: string]: any } {
    // Instance of custom will be replaced based on which lifecycle hooks have been evaluated
    // always fetch a fresh instance
    return this.serverless.service.custom || {};
  }

  private afterPackageCreateDeploymentArtifacts(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.afterPackageCreateDeploymentArtifacts()');
    this.cleanupFiles();
  }

  private afterPackageInitialize(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.afterPackageInitialize()');
    this.formatCommandLineOpts();
    this.validatePluginOptions();

    // Add log processing lambda
    // TODO: Find the right lifecycle method for this
    this.addLogProcesser();
  }

  private mergeCustomProviderResources(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.mergeCustomProviderResources()');
    const { includeApiGWLogs, retentionInDays, useDefaultRole, xrayTracingPermissions } = this.custom().esLogs;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    // Add cloudwatch subscriptions to firehose for functions' log groups
    this.addLambdaCloudwatchSubscriptions();

    // Configure Cloudwatch log retention
    if (retentionInDays !== undefined) {
      this.configureLogRetention(retentionInDays);
    }

    // Add xray permissions if option is enabled
    if (xrayTracingPermissions === true) {
      const statement = iamLambdaTemplate.ServerlessEsLogsLambdaIAMRole.Properties.Policies[0].PolicyDocument.Statement;
      statement.push(withXrayTracingPermissions);
    }

    // Add IAM role for cloudwatch -> elasticsearch lambda
    if (this.serverless.service.provider.role && !useDefaultRole) {
      _.merge(template.Resources, iamLambdaTemplate);
      this.patchLogProcesserRole();
    } else if (!this.serverless.service.provider.role) {
      // Merge log processor role policies into default role
      const updatedPolicies = template.Resources.IamRoleLambdaExecution.Properties.Policies.concat(
        iamLambdaTemplate.ServerlessEsLogsLambdaIAMRole.Properties.Policies,
      );
      template.Resources.IamRoleLambdaExecution.Properties.Policies = updatedPolicies;
    }

    // Add cloudwatch subscription for API Gateway logs
    if (includeApiGWLogs === true) {
      this.addApiGwCloudwatchSubscription();
    }
  }

  private formatCommandLineOpts(): void {
    this.options.stage = this.options.stage
      || this.serverless.service.provider.stage
      || (this.serverless.service.defaults && this.serverless.service.defaults.stage)
      || 'dev';
    this.options.region = this.options.region
      || this.serverless.service.provider.region
      || (this.serverless.service.defaults && this.serverless.service.defaults.region)
      || 'us-east-1';
  }

  private validatePluginOptions(): void {
    const { esLogs } = this.custom();
    if (!esLogs) {
      throw new this.serverless.classes.Error(`ERROR: No configuration provided for serverless-es-logs!`);
    }

    const { endpoint, index, tags } = esLogs;
    if (!endpoint) {
      throw new this.serverless.classes.Error(`ERROR: Must define an endpoint for serverless-es-logs!`);
    }

    if (!index) {
      throw new this.serverless.classes.Error(`ERROR: Must define an index for serverless-es-logs!`);
    }

    if (tags && !_.isPlainObject(tags)) {
      throw new this.serverless.classes.Error(`ERROR: Tags must be an object! You provided '${tags}'.`);
    }
  }

  private addApiGwCloudwatchSubscription(): void {
    const { esLogs } = this.custom();
    const filterPattern = esLogs.apiGWFilterPattern || this.defaultApiGWFilterPattern;
    const apiGwLogGroupLogicalId = 'ApiGatewayLogGroup';
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    // Check if API Gateway log group exists
    /* istanbul ignore else */
    if (template && template.Resources[apiGwLogGroupLogicalId]) {
      const { LogGroupName } = template.Resources[apiGwLogGroupLogicalId].Properties;
      const subscriptionLogicalId = `${apiGwLogGroupLogicalId}SubscriptionFilter`;
      const permissionLogicalId = `${apiGwLogGroupLogicalId}CWPermission`;
      const processorFunctionName = template.Resources[this.logProcesserLogicalId].Properties.FunctionName;

      // Create permission for subscription filter
      const permission = new LambdaPermissionBuilder()
        .withFunctionName(processorFunctionName)
        .withPrincipal({
          'Fn::Sub': 'logs.${AWS::Region}.amazonaws.com',
        })
        .withSourceArn({
          'Fn::Join': [
            '',
            [
              'arn:aws:logs:',
              {
                Ref: 'AWS::Region',
              },
              ':',
              {
                Ref: 'AWS::AccountId',
              },
              ':log-group:',
              LogGroupName,
              '*',
            ],
          ],
        })
        .withDependsOn([ this.logProcesserLogicalId, apiGwLogGroupLogicalId ])
        .build();

      // Create subscription filter
      const subscriptionFilter = new SubscriptionFilterBuilder()
        .withDestinationArn({
          'Fn::GetAtt': [
            this.logProcesserLogicalId,
            'Arn',
          ],
        })
        .withFilterPattern(filterPattern)
        .withLogGroupName(LogGroupName)
        .withDependsOn([ this.logProcesserLogicalId, permissionLogicalId ])
        .build();

      // Create subscription template
      const subscriptionTemplate = new TemplateBuilder()
        .withResource(permissionLogicalId, permission)
        .withResource(subscriptionLogicalId, subscriptionFilter)
        .build();

      _.merge(template, subscriptionTemplate);
    }
  }

  private addLambdaCloudwatchSubscriptions(): void {
    const { esLogs } = this.custom();
    const filterPattern = esLogs.filterPattern || this.defaultLambdaFilterPattern;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const functions = this.serverless.service.getAllFunctions();

    // Add cloudwatch subscription for each function except log processer
    functions.forEach((name: string) => {
      /* istanbul ignore if */
      if (name === this.logProcesserName) {
        return;
      }

      const normalizedFunctionName = this.provider.naming.getNormalizedFunctionName(name);
      const subscriptionLogicalId = `${normalizedFunctionName}SubscriptionFilter`;
      const permissionLogicalId = `${normalizedFunctionName}CWPermission`;
      const logGroupLogicalId = `${normalizedFunctionName}LogGroup`;
      const logGroupName = template.Resources[logGroupLogicalId].Properties.LogGroupName;

      // Create permission for subscription filter
      const permission = new LambdaPermissionBuilder()
        .withFunctionName({
          'Fn::GetAtt': [
            this.logProcesserLogicalId,
            'Arn',
          ],
        })
        .withPrincipal({
          'Fn::Sub': 'logs.${AWS::Region}.amazonaws.com',
        })
        .withSourceArn({
          'Fn::GetAtt': [
            logGroupLogicalId,
            'Arn',
          ],
        })
        .withDependsOn([ this.logProcesserLogicalId, logGroupLogicalId ])
        .build();

      // Create subscription filter
      const subscriptionFilter = new SubscriptionFilterBuilder()
        .withDestinationArn({
          'Fn::GetAtt': [
            this.logProcesserLogicalId,
            'Arn',
          ],
        })
        .withFilterPattern(filterPattern)
        .withLogGroupName(logGroupName)
        .withDependsOn([ this.logProcesserLogicalId, permissionLogicalId ])
        .build();

      // Create subscription template
      const subscriptionTemplate = new TemplateBuilder()
        .withResource(permissionLogicalId, permission)
        .withResource(subscriptionLogicalId, subscriptionFilter)
        .build();

      _.merge(template, subscriptionTemplate);
    });
  }

  private configureLogRetention(retentionInDays: number): void {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    Object.keys(template.Resources).forEach((key: string) => {
      if (template.Resources[key].Type === 'AWS::Logs::LogGroup') {
        template.Resources[key].Properties.RetentionInDays = retentionInDays;
      }
    });
  }

  private addLogProcesser(): void {
    const { index, endpoint, tags } = this.custom().esLogs;
    const tagsStringified = tags ? JSON.stringify(tags) : /* istanbul ignore next */ '';
    const dirPath = path.join(this.serverless.config.servicePath, this.logProcesserDir);
    const filePath = path.join(dirPath, 'index.js');
    const handler = `${this.logProcesserDir}/index.handler`;
    const name = `${this.serverless.service.service}-${this.options.stage}-es-logs-plugin`;
    fs.ensureDirSync(dirPath);
    fs.copySync(path.resolve(__dirname, '../templates/code/logsToEs.js'), filePath);
    this.serverless.service.functions[this.logProcesserName] = {
      description: 'Serverless ES Logs Plugin',
      environment: {
        ES_ENDPOINT: endpoint,
        ES_INDEX_PREFIX: index,
        ES_TAGS: tagsStringified,
      },
      events: [],
      handler,
      memorySize: 512,
      name,
      package: {
        exclude: ['**'],
        include: [`${this.logProcesserDir}/**`],
        individually: true,
      },
      runtime: 'nodejs10.x',
      timeout: 60,
      tracing: false,
    };
  }

  private patchLogProcesserRole(): void {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    // Update lambda dependencies
    template.Resources[this.logProcesserLogicalId].DependsOn.push('ServerlessEsLogsLambdaIAMRole');
    template.Resources[this.logProcesserLogicalId].Properties.Role = {
      'Fn::GetAtt': [
        'ServerlessEsLogsLambdaIAMRole',
        'Arn',
      ],
    };
  }

  private cleanupFiles(): void {
    const dirPath = path.join(this.serverless.config.servicePath, this.logProcesserDir);
    fs.removeSync(dirPath);
  }
}

export = ServerlessEsLogsPlugin;
