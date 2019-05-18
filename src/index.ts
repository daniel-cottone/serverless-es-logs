import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';

import { LambdaPermissionBuilder, SubscriptionFilterBuilder, TemplateBuilder } from './utils';

// tslint:disable:no-var-requires
const iamLambdaTemplate = require('../templates/iam/lambda-role.json');
// tslint:enable:no-var-requires

class ServerlessEsLogsPlugin {
  public hooks: { [name: string]: () => void };
  private provider: any;
  private serverless: any;
  private options: { [name: string]: any };
  private logProcesserDir: string = '_es-logs';
  private logProcesserName: string = 'esLogsProcesser';
  private defaultLambdaFilterPattern: string = '[timestamp=*Z, request_id="*-*", event]';
  private defaultApiGWFilterPattern: string = '[apigw_request_id="*-*", event]';

  constructor(serverless: any, options: { [name: string]: any }) {
    this.serverless = serverless;
    this.provider = serverless.getProvider('aws');
    this.options = options;
    // tslint:disable:object-literal-sort-keys
    this.hooks = {
      'after:package:initialize': this.afterPackageInitialize.bind(this),
      'after:package:createDeploymentArtifacts': this.afterPackageCreateDeploymentArtifacts.bind(this),
      'aws:package:finalize:mergeCustomProviderResources': this.mergeCustomProviderResources.bind(this),
      'before:aws:deploy:deploy:updateStack': this.beforeAwsDeployUpdateStack.bind(this),
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
    const { retentionInDays, useDefaultRole } = this.custom().esLogs;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    // Add cloudwatch subscriptions to firehose for functions' log groups
    this.addLambdaCloudwatchSubscriptions();

    // Configure Cloudwatch log retention
    if (retentionInDays !== undefined) {
      this.configureLogRetention(retentionInDays);
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
  }

  private beforeAwsDeployUpdateStack(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.beforeAwsDeployUpdateStack()');
    const { includeApiGWLogs } = this.custom().esLogs;

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
    const filterPattern = this.defaultApiGWFilterPattern;
    const apiGatewayStageLogicalId = 'ApiGatewayStage';
    const processorAliasLogicalId = 'EsLogsProcesserAlias';
    const template = this.serverless.service.provider.compiledCloudFormationAliasTemplate;

    // Check if API Gateway stage exists
    /* istanbul ignore else */
    if (template && template.Resources[apiGatewayStageLogicalId]) {
      const { StageName, RestApiId } = template.Resources[apiGatewayStageLogicalId].Properties;
      const subscriptionLogicalId = `${apiGatewayStageLogicalId}SubscriptionFilter`;
      const permissionLogicalId = `${apiGatewayStageLogicalId}CWPermission`;
      const processorFunctionName = template.Resources[processorAliasLogicalId].Properties.FunctionName;

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
              ':log-group:API-Gateway-Execution-Logs_',
              RestApiId,
              '/*',
            ],
          ],
        })
        .withDependsOn([ processorAliasLogicalId, apiGatewayStageLogicalId ])
        .build();

      // Create subscription filter
      const subscriptionFilter = new SubscriptionFilterBuilder()
        .withDestinationArn(processorFunctionName)
        .withFilterPattern(filterPattern)
        .withLogGroupName({
          'Fn::Join': [
            '',
            [
              'API-Gateway-Execution-Logs_',
              RestApiId,
              `/${StageName}`,
            ],
          ],
        })
        .withDependsOn([ processorAliasLogicalId, permissionLogicalId ])
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
    const processorLogicalId = 'EsLogsProcesserLambdaFunction';

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
            processorLogicalId,
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
        .withDependsOn([ processorLogicalId, logGroupLogicalId ])
        .build();

      // Create subscription filter
      const subscriptionFilter = new SubscriptionFilterBuilder()
        .withDestinationArn({
          'Fn::GetAtt': [
            processorLogicalId,
            'Arn',
          ],
        })
        .withFilterPattern(filterPattern)
        .withLogGroupName(logGroupName)
        .withDependsOn([ processorLogicalId, permissionLogicalId ])
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
      runtime: 'nodejs8.10',
      timeout: 60,
      tracing: false,
    };
  }

  private patchLogProcesserRole(): void {
    const normalizedFunctionName = this.provider.naming.getNormalizedFunctionName(this.logProcesserName);
    const templateKey = `${normalizedFunctionName}LambdaFunction`;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    // Update lambda dependencies
    template.Resources[templateKey].DependsOn.push('ServerlessEsLogsLambdaIAMRole');
    template.Resources[templateKey].Properties.Role = {
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
