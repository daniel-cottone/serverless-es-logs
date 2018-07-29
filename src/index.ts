import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';

import { formatFirehose, formatIamFirehoseRole, formatLogGroup } from './formatters';

// tslint:disable:no-var-requires
const cloudwatchLogGroupTemplate = require('../templates/cloudwatch-log-group.json');
const cloudwatchLogStreamEsTemplate = require('../templates/cloudwatch-log-stream-es.json');
const cloudwatchLogStreamS3Template = require('../templates/cloudwatch-log-stream-s3.json');
const firehoseTemplate = require('../templates/firehose.json');
const iamCloudwatchTemplate = require('../templates/iam-cloudwatch.json');
const iamLambdaTemplate = require('../templates/iam-lambda.json');
const iamFirehoseTemplate = require('../templates/iam-firehose.json');
const s3Template = require('../templates/s3.json');
// tslint:enable:no-var-requires

class ServerlessEsLogsPlugin {
  private provider: any;
  private hooks: { [name: string]: () => void };
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
    this.hooks = {
      'after:package:initialize': this.afterPackageInitialize.bind(this),
      'after:package:createDeploymentArtifacts': this.afterPackageCreateDeploymentArtifacts.bind(this),
      'aws:package:finalize:mergeCustomProviderResources': this.mergeCustomProviderResources.bind(this),
    };
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
    
    // Add log processing lambda
    // TODO: Find the right lifecycle method for this
    this.addLogProcesser();
  }

  private mergeCustomProviderResources(): void {
    this.serverless.cli.log('ServerlessEsLogsPlugin.mergeCustomProviderResources()');
    const { stage, region } = this.options;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const formatOpts = {
      options: {
        ...this.custom.esLogs,
      },
      region,
      service: this.serverless.service.service,
      stage,
    };

    // Add cloudwatch subscriptions to firehose for functions' log groups
    this.addCloudwatchSubscriptions();

    // Add custom resources for firehose -> elasticsearch
    _.merge(template.Resources, s3Template);
    _.merge(template.Resources, formatLogGroup({
      ...formatOpts,
      template: cloudwatchLogGroupTemplate,
    }));
    _.merge(template.Resources, cloudwatchLogStreamEsTemplate);
    _.merge(template.Resources, cloudwatchLogStreamS3Template);
    _.merge(template.Resources, iamCloudwatchTemplate);
    _.merge(template.Resources, iamLambdaTemplate);
    _.merge(template.Resources, formatIamFirehoseRole({
      ...formatOpts,
      template: iamFirehoseTemplate,
    }));
    _.merge(template.Resources, formatFirehose({
      ...formatOpts,
      template: firehoseTemplate,
    }));

    // Patch log processer lambda role
    this.patchLogProcesserRole();
  }

  private addCloudwatchSubscriptions(): void {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    const subscriptionsTemplate: { [name: string]: any } = {};
    const functions = this.serverless.service.getAllFunctions();
    functions.forEach((name: string) => {
      if (name === this.logProcesserName) {
        return;
      }

      const normalizedFunctionName = this.provider.naming.getNormalizedFunctionName(name);
      const logicalId = `${normalizedFunctionName}SubscriptionFilter`;
      const logGroupLogicalId = `${normalizedFunctionName}LogGroup`;
      const logGroupName = template.Resources[logGroupLogicalId].Properties.LogGroupName;
      subscriptionsTemplate[logicalId] = {
        DependsOn: [
          'ServerlessEsLogsFirehose',
          'ServerlessEsLogsCWIAMRole',
        ],
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
        Type : 'AWS::Logs::SubscriptionFilter',
      };
    });
    _.merge(template.Resources, subscriptionsTemplate);
  }

  private addLogProcesser(): void {
    const dirPath = path.join(this.serverless.config.servicePath, this.logProcesserDir);
    const filePath = path.join(dirPath, 'index.js');
    const handler = `${this.logProcesserDir}/index.handler`;
    const name = `${this.serverless.service.service}-${this.options.stage}-es-logs-plugin`;
    fs.ensureDirSync(dirPath);
    fs.copySync(path.resolve(__dirname, '../templates/logProcesser.js'), filePath);
    this.serverless.service.functions[this.logProcesserName] = {
      description: 'Serverless ES Logs Plugin',
      handler,
      events: [],
      memorySize: 512,
      name,
      runtime: 'nodejs8.10',
      package: {
        individually: true,
        exclude: ['**'],
        include: [this.logProcesserDir + '/**'],
      },
      timeout: 60,
    };
  }

  private patchLogProcesserRole(): void {
    const normalizedFunctionName = this.provider.naming.getNormalizedFunctionName(this.logProcesserName);
    const templateKey = `${normalizedFunctionName}LambdaFunction`;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
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
