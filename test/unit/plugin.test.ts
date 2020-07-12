import { expect } from 'chai';
import { random } from 'faker';
import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';

import ServerlessEsLogsPlugin from '../../src';
import { ServerlessBuilder } from '../support';

// tslint:disable
describe('serverless-es-logs :: Plugin tests', () => {
  const dirPath = path.join(process.cwd(), '_es-logs');
  const defaultOptions = {
    service: {
      custom: {
        esLogs: {
          endpoint: 'some_endpoint',
          index: 'some_index',
          tags: {},
        },
      },
    },
  };
  let serverless: any;
  let options: { [name: string]: any };
  let plugin: ServerlessEsLogsPlugin;

  beforeEach(() => {
    serverless = new ServerlessBuilder(defaultOptions).build();
    options = {};
    plugin = new ServerlessEsLogsPlugin(serverless, options);
  });

  afterEach(() => {
    fs.removeSync(dirPath);
  });

  const addFunctions = (numFunctions: number) => {
    for (let i = 0; i < numFunctions; i++) {
      const functionName = `function${i}`;
      const normalized = serverless.getProvider('aws').naming.getNormalizedFunctionName(functionName);
      serverless.service.functions[functionName] = {};
      serverless.service.provider.compiledCloudFormationTemplate.Resources[`${normalized}LogGroup`] = {
        Properties: {
          LogGroupName: 'logGroupName',
        },
        Type: 'AWS::Logs::LogGroup',
      };
    }
    plugin = new ServerlessEsLogsPlugin(serverless, options);       
  };

  describe('#hooks', () => {
    describe('after:package:initialize', () => {
      it('should exist', () => {
        expect(plugin.hooks['after:package:initialize']).to.exist;
      });

      describe('#validatePluginOptions()', () => {
        it('should validate plugin options successfully', () => {
          expect(plugin.hooks['after:package:initialize']).to.not.throw;
        });

        it('should throw an error if missing plugin options', () => {
          serverless = new ServerlessBuilder().build();
          plugin = new ServerlessEsLogsPlugin(serverless, options);
          expect(plugin.hooks['after:package:initialize']).to.throw(
            Error,
            'ERROR: No configuration provided for serverless-es-logs!',
          );
        });
  
        it('should throw an error if missing option \'endpoint\'', () => {
          const opts = {
            service: {
              custom: {
                esLogs: {
                  index: 'some_index',
                },
              },
            },
          };
          serverless = new ServerlessBuilder(opts).build();
          plugin = new ServerlessEsLogsPlugin(serverless, options);
          expect(plugin.hooks['after:package:initialize']).to.throw(
            Error,
            'ERROR: Must define an endpoint for serverless-es-logs!',
          );
        });
  
        it('should throw an error if missing option \'index\'', () => {
          const opts = {
            service: {
              custom: {
                esLogs: {
                  endpoint: 'some_endpoint',
                },
              },
            },
          };
          serverless = new ServerlessBuilder(opts).build();
          plugin = new ServerlessEsLogsPlugin(serverless, options);
          expect(plugin.hooks['after:package:initialize']).to.throw(
            Error,
            'ERROR: Must define an index for serverless-es-logs!',
          );
        });

        it('should throw an error if \'tags\' are not an object', () => {
          const opts = {
            service: {
              custom: {
                esLogs: {
                  index: 'some_index',
                  endpoint: 'some_endpoint',
                  tags: 'bad_tags',
                },
              },
            },
          };
          serverless = new ServerlessBuilder(opts).build();
          plugin = new ServerlessEsLogsPlugin(serverless, options);
          expect(plugin.hooks['after:package:initialize']).to.throw(
            Error,
            "ERROR: Tags must be an object! You provided 'bad_tags'.",
          );
        });
      });

      it('should throw an error if \'indexDateSeparator\' is not a string', () => {
        const opts = {
          service: {
            custom: {
              esLogs: {
                index: 'some_index',
                indexDateSeparator: 100,
                endpoint: 'some_endpoint',
              },
            },
          },
        };
        serverless = new ServerlessBuilder(opts).build();
        plugin = new ServerlessEsLogsPlugin(serverless, options);
        expect(plugin.hooks['after:package:initialize']).to.throw(
          Error,
          "ERROR: indexDateSeparator must be a string! You provided '100'.",
        );
      });

      describe('#addLogProcesser()', () => {
        it('should create the log processer function', () => {
          plugin.hooks['after:package:initialize']();
          expect(serverless.service.functions).to.have.property('esLogsProcesser');
          expect(fs.existsSync(dirPath)).to.be.true;
        });

        it('should add vpc config if specified', () => {
          const vpc = {
            securityGroupIds: ['securityGroup'],
            subnetIds: ['subnet']
          };
          const opts = {
            service: {
              custom: {
                esLogs: {
                  endpoint: 'some_endpoint',
                  index: 'some_index',
                  vpc
                },
              },
            },
          };
          
          serverless = new ServerlessBuilder(opts).build();
          plugin = new ServerlessEsLogsPlugin(serverless, options);
          plugin.hooks['after:package:initialize']();
          expect(serverless.service.functions.esLogsProcesser).to.have.deep.property('vpc', vpc);
        });
      });
    });

    describe('after:package:createDeploymentArtifacts', () => {
      it('should exist', () => {
        expect(plugin.hooks['after:package:createDeploymentArtifacts']).to.exist;
      });

      describe('#cleanupFiles()', () => {
        it('should cleanup the log processer code dir', () => {
          fs.ensureDirSync(dirPath);
          plugin.hooks['after:package:createDeploymentArtifacts']();
          expect(fs.existsSync(dirPath)).to.be.false;
        });
      });
    });

    describe('aws:package:finalize:mergeCustomProviderResources', () => {
      it('should exist', () => {
        expect(plugin.hooks['aws:package:finalize:mergeCustomProviderResources']).to.exist;
      });

      it('should create an IAM role for the log processer function if default role specified', () => {
        serverless.service.provider.role = random.word();
        plugin = new ServerlessEsLogsPlugin(serverless, options);
        const template = serverless.service.provider.compiledCloudFormationTemplate;
        plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
        expect(template.Resources).to.have.property('ServerlessEsLogsLambdaIAMRole');
      });

      it('should use the default role if \'useDefaultRole\' option specified', () => {
        serverless.service.custom.esLogs.useDefaultRole = true;
        serverless.service.provider.role = random.word();
        plugin = new ServerlessEsLogsPlugin(serverless, options);
        const template = serverless.service.provider.compiledCloudFormationTemplate;
        plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
        expect(template.Resources).to.not.have.property('ServerlessEsLogsLambdaIAMRole');
        expect(template.Resources.IamRoleLambdaExecution.Properties.Policies).to.deep.equal([]);
      });

      it('should append ES policy to generated role if no default role specified', () => {
        const template = serverless.service.provider.compiledCloudFormationTemplate;
        plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
        expect(template.Resources).to.have.property('IamRoleLambdaExecution');
        expect(template.Resources.IamRoleLambdaExecution.Properties.Policies).to.have.deep.members([{
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  'logs:CreateLogGroup',
                  'logs:CreateLogStream',
                  'logs:PutLogEvents',
                ],
                Effect: 'Allow',
                Resource: 'arn:aws:logs:*:*:*',
              },
              {
                Action: 'es:ESHttpPost',
                Effect: 'Allow',
                Resource: {
                  'Fn::Sub': 'arn:aws:es:${AWS::Region}:${AWS::AccountId}:domain/*',
                },
              },
              {
                Action: [
                  'ec2:CreateNetworkInterface',
                  'ec2:DescribeNetworkInterfaces',
                  'ec2:DeleteNetworkInterface',
                ],
                Effect: 'Allow',
                Resource: '*',
              }
            ],
            Version: '2012-10-17',
          },
          PolicyName: 'cw-to-elasticsearch-policy',
        }]);
      });

      it('should append xray permissions policy to generated role if option is enabled and no default role specified', () => {
        const template = serverless.service.provider.compiledCloudFormationTemplate;
        serverless.service.custom.esLogs.xrayTracingPermissions = true;
        plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
        expect(template.Resources).to.have.property('IamRoleLambdaExecution');
        expect(template.Resources.IamRoleLambdaExecution.Properties.Policies).to.have.deep.members([{
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  'logs:CreateLogGroup',
                  'logs:CreateLogStream',
                  'logs:PutLogEvents',
                ],
                Effect: 'Allow',
                Resource: 'arn:aws:logs:*:*:*',
              },
              {
                Action: 'es:ESHttpPost',
                Effect: 'Allow',
                Resource: {
                  'Fn::Sub': 'arn:aws:es:${AWS::Region}:${AWS::AccountId}:domain/*',
                },
              },
              {
                Action: [
                  'ec2:CreateNetworkInterface',
                  'ec2:DescribeNetworkInterfaces',
                  'ec2:DeleteNetworkInterface',
                ],
                Effect: 'Allow',
                Resource: '*',
              },
              {
                Action: [
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords",
                    "xray:GetSamplingRules",
                    "xray:GetSamplingTargets",
                    "xray:GetSamplingStatisticSummaries"
                ],
                Effect: "Allow",
                Resource: "*"
              }
            ],
            Version: '2012-10-17',
          },
          PolicyName: 'cw-to-elasticsearch-policy',
        }]);
      });

      describe('#addLambdaCloudwatchSubscriptions()', () => {
        it('shouldn\'t add any subscriptions or permissions if there are no functions', () => {
          const template = serverless.service.provider.compiledCloudFormationTemplate;
          plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
          const subscriptions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Logs::SubscriptionFilter');
          const permissions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Lambda::Permission');
          expect(subscriptions.length).to.equal(0);
          expect(permissions.length).to.equal(0);
        });

        it('should create a subscription and permission per function', () => {
          const numFunctions = random.number({ min: 1, max: 5 });
          addFunctions(numFunctions);
          const template = serverless.service.provider.compiledCloudFormationTemplate;
          plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
          const subscriptions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Logs::SubscriptionFilter');
          const permissions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Lambda::Permission');
          expect(subscriptions.length).to.equal(numFunctions);
          expect(permissions.length).to.equal(numFunctions);
        });
      });

      describe('#configureLogRetention()', () => {
        it('shouldn\'t configure log retention if \'configureLogRetention\' option is not set', () => {
          const numFunctions = random.number({ min: 1, max: 5 });
          addFunctions(numFunctions);
          const template = serverless.service.provider.compiledCloudFormationTemplate;
          plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
          const logGroups = _.filter(template.Resources, (v, k) => {
            return v.Type === 'AWS::Logs::LogGroup' && v.Properties.RetentionInDays !== undefined;
          });
          expect(logGroups.length).to.equal(0);
        });

        it('should configure log retention per function', () => {
          serverless.service.custom.esLogs.retentionInDays = 7;
          const numFunctions = random.number({ min: 1, max: 5 });
          addFunctions(numFunctions);
          const template = serverless.service.provider.compiledCloudFormationTemplate;
          plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
          const logGroups = _.filter(template.Resources, (v, k) => {
            return v.Type === 'AWS::Logs::LogGroup' && v.Properties.RetentionInDays !== undefined;
          });
          expect(logGroups.length).to.equal(numFunctions);
        });
      });

      describe('#addApiGwCloudwatchSubscription()', () => {
        it('should skip if \'includeApiGWLogs\' option not set', () => {
          const template = serverless.service.provider.compiledCloudFormationTemplate;
          plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
          const subscriptions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Logs::SubscriptionFilter');
          const permissions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Lambda::Permission');
          expect(subscriptions.length).to.equal(0);
          expect(permissions.length).to.equal(0);
        });

        it('should create a subscription and permission for API Gateway logs', () => {
          serverless.service.custom.esLogs.includeApiGWLogs = true;
          plugin = new ServerlessEsLogsPlugin(serverless, options);
          const template = serverless.service.provider.compiledCloudFormationTemplate;
          plugin.hooks['aws:package:finalize:mergeCustomProviderResources']();
          const subscriptions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Logs::SubscriptionFilter');
          const permissions = _.filter(template.Resources, (v, k) => v.Type === 'AWS::Lambda::Permission');
          expect(subscriptions.length).to.equal(1);
          expect(permissions.length).to.equal(1);
        });
      });
    });
  });

  describe('#constructor()', () => {
    it('should initialize plugin', () => {
      expect(plugin).to.be.an.instanceOf(ServerlessEsLogsPlugin);
    });
  });
});
