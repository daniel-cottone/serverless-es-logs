import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';

// tslint:disable:no-var-requires
const iamLambdaTemplate = require('../templates/iam/lambda-role.json');
// tslint:enable:no-var-requires

class ServerlessEsLogsPlugin {
  public hooks: { [name: string]: () => void };
  private provider: any;
  private serverless: any;
  private options: { [name: string]: any };
  private custom: { [name: string]: any };
  private logProcesserDir: string = '_es-logs';
  private logProcesserName: string = 'esLogsProcesser';

  constructor(serverless: any, options: { [name: string]: any }) {
    this.serverless = serverless;
    this.provider = serverless.getProvider('aws');
    this.options = options;
    this.custom = serverless.service.custom || {};
    // tslint:disable:object-literal-sort-keys
    this.hooks = {
      'after:package:initialize': this.afterPackageInitialize.bind(this),
      'after:package:createDeploymentArtifacts': this.afterPackageCreateDeploymentArtifacts.bind(this),
      'aws:package:finalize:mergeCustomProviderResources': this.mergeCustomProviderResources.bind(this),
    };
    // tslint:enable:object-literal-sort-keys
  }

  private afterPackageCreateDeploymentArtifacts(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.afterPackageCreateDeploymentArtifacts()');
    this.cleanupFiles();
  }

  private afterPackageInitialize(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.afterPackageInitialize()');
    this.options.stage = this.options.stage
      || this.serverless.service.provider.stage
      || (this.serverless.service.defaults && this.serverless.service.defaults.stage)
      || 'dev';
    this.options.region = this.options.region
      || this.serverless.service.provider.region
      || (this.serverless.service.defaults && this.serverless.service.defaults.region)
      || 'us-east-1';
    this.validatePluginOptions();

    // Add log processing lambda
    // TODO: Find the right lifecycle method for this
    this.addLogProcesser();
  }

  private mergeCustomProviderResources(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.mergeCustomProviderResources()');
    const { stage, region } = this.options;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    // Add cloudwatch subscriptions to firehose for functions' log groups
    this.addCloudwatchSubscriptions();

    // Add IAM role for cloudwatch -> elasticsearch lambda
    _.merge(template.Resources, iamLambdaTemplate);

    // Patch lambda role
    this.patchLogProcesserRole();
  }

  private validatePluginOptions(): void {
    const { esLogs } = this.custom;
    if (!esLogs) {
      throw new this.serverless.classes.Error(`ERROR: No configuration provided for serverless-es-logs!`);
    }

    const { endpoint, index } = esLogs;
    if (!endpoint) {
      throw new this.serverless.classes.Error(`ERROR: Must define an endpoint for serverless-es-logs!`);
    }

    if (!index) {
      throw new this.serverless.classes.Error(`ERROR: Must define an index for serverless-es-logs!`);
    }
  }

  private addCloudwatchSubscriptions(): void {
    this.addLambdaLogSubscriptions();
  }

  private addApiGwLogSubscription(): void {
    // filter: [apigw_request_id="*-*", event]
  }

  private addLambdaLogSubscriptions(): void {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const subscriptionsTemplate: { [name: string]: any } = {};
    const functions = this.serverless.service.getAllFunctions();
    functions.forEach((name: string) => {
      if (name === this.logProcesserName) {
        return;
      }

      const normalizedFunctionName = this.provider.naming.getNormalizedFunctionName(name);
      const subscriptionLogicalId = `${normalizedFunctionName}SubscriptionFilter`;
      const permissionLogicalId = `${normalizedFunctionName}CWPermission`;
      const logGroupLogicalId = `${normalizedFunctionName}LogGroup`;
      const logGroupName = template.Resources[logGroupLogicalId].Properties.LogGroupName;

      // Create lambda permission for subscription filter
      subscriptionsTemplate[permissionLogicalId] = {
        DependsOn: [
          'EsLogsProcesserLambdaFunction',
          logGroupLogicalId,
        ],
        Properties: {
          Action: 'lambda:InvokeFunction',
          FunctionName: {
            'Fn::GetAtt': [
              'EsLogsProcesserLambdaFunction',
              'Arn',
            ],
          },
          Principal: {
            'Fn::Sub': 'logs.${AWS::Region}.amazonaws.com',
          },
          SourceAccount: {
            'Fn::Sub': '${AWS::AccountId}',
          },
          SourceArn: {
            'Fn::GetAtt': [
              logGroupLogicalId,
              'Arn',
            ],
          },
        },
        Type: 'AWS::Lambda::Permission',
      };

      // Create subscription filter
      subscriptionsTemplate[subscriptionLogicalId] = {
        DependsOn: [
          'EsLogsProcesserLambdaFunction',
          permissionLogicalId,
        ],
        Properties: {
          DestinationArn: {
            'Fn::GetAtt': [
              'EsLogsProcesserLambdaFunction',
              'Arn',
            ],
          },
          FilterPattern: '[timestamp=*Z, request_id="*-*", event]',
          LogGroupName: logGroupName,
        },
        Type : 'AWS::Logs::SubscriptionFilter',
      };
    });
    _.merge(template.Resources, subscriptionsTemplate);
  }

  private addLogProcesser(): void {
    const { index, endpoint } = this.custom.esLogs;
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
        INDEX_PREFIX: index,
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
