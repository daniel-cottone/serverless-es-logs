import _ from 'lodash';

import { formatLogGroup, formatFirehose, formatIamFirehoseRole } from './formatters';

const cloudwatchLogGroupTemplate = require('../templates/cloudwatch-log-group.json');
const cloudwatchLogStreamEsTemplate = require('../templates/cloudwatch-log-stream-es.json');
const cloudwatchLogStreamS3Template = require('../templates/cloudwatch-log-stream-s3.json');
const firehoseTemplate = require('../templates/firehose.json');
const iamCloudwatchTemplate = require('../templates/iam-cloudwatch.json');
const iamFirehoseTemplate = require('../templates/iam-firehose.json');
const s3Template = require('../templates/s3.json');

class ServerlessEsLogsPlugin {
  private provider: any;
  private hooks: { [name: string]: () => void };
  private serverless: any;
  private options: { [name: string]: any };
  private custom: { [name: string]: any };

  constructor(serverless: any, options: { [name: string]: any }) {
    this.serverless = serverless;
    this.provider = serverless.getProvider('aws');
    this.options = options;
    this.custom = serverless.service.custom || {};
    this.hooks = {
      'after:package:initialize': this.afterPackageInitialize.bind(this),
      'aws:package:finalize:mergeCustomProviderResources': this.mergeResources.bind(this),
    };
  }

  private afterPackageInitialize(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.afterPackageInitialize()');
    this.options.stage  = this.options.stage
      || this.serverless.service.provider.stage
      || (this.serverless.service.defaults && this.serverless.service.defaults.stage)
      || 'dev';
    this.options.region = this.options.region
      || this.serverless.service.provider.region
      || (this.serverless.service.defaults && this.serverless.service.defaults.region)
      || 'us-east-1';
  }

  private mergeResources(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.mergeResources()');
    const { stage, region } = this.options;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const formatOpts = {
      service: this.serverless.service.service,
      stage,
      region,
      options: {
        ...this.custom.esLogs,
      },
    };

    // Add cloudwatch subscriptions to existing functions
    this.addCloudwatchSubscriptions();

    // Add resources for firehose -> elasticsearch
    _.merge(template.Resources, s3Template);
    _.merge(template.Resources, formatLogGroup({
      ...formatOpts,
      template: cloudwatchLogGroupTemplate,
    }));
    _.merge(template.Resources, cloudwatchLogStreamEsTemplate);
    _.merge(template.Resources, cloudwatchLogStreamS3Template);
    _.merge(template.Resources, iamCloudwatchTemplate);
    _.merge(template.Resources, formatIamFirehoseRole({
      ...formatOpts,
      template: iamFirehoseTemplate,
    }));
    _.merge(template.Resources, formatFirehose({
      ...formatOpts,
      template: firehoseTemplate,
    }));
  
    console.log(JSON.stringify(template, null, 2));
  }

  private addCloudwatchSubscriptions(): void {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const subscriptionsTemplate: { [name: string]: any } = {};
    const functions = this.serverless.service.getAllFunctions();
    functions.forEach((name: string) => {
      const normalizedFunctionName = this.provider.naming.getNormalizedFunctionName(name);
      const logicalId = `${normalizedFunctionName}SubscriptionFilter`;
      const logGroupLogicalId = `${normalizedFunctionName}LogGroup`;
      const logGroupName = template.Resources[logGroupLogicalId].Properties.LogGroupName;
      subscriptionsTemplate[logicalId] = {
        Type : 'AWS::Logs::SubscriptionFilter',
        Properties: {
          DestinationArn: {
            'Fn::GetAtt': [
              'ServerlessEsLogsFirehose',
              'Arn',
            ],
          },
          FilterPattern: '',
          LogGroupName: logGroupName,
          RoleArn: {
            'Fn::GetAtt': [
              'ServerlessEsLogsCWIAMRole',
              'Arn',
            ],
          },
        },
        DependsOn: [
          'ServerlessEsLogsFirehose',
          'ServerlessEsLogsCWIAMRole',
        ],
      };
    });
    _.merge(template.Resources, subscriptionsTemplate);
  }
}

export = ServerlessEsLogsPlugin;
