import _ from 'lodash';
import sinon from 'sinon';

const normalizeName = (name: string) => name && `${_.startCase(name).split(' ').join('')}`;

export class ServerlessBuilder {
  private readonly defaults = {
    classes: {
      Error,
    },
    cli: {
      log: sinon.stub(),
    },
    config: {
      servicePath: '',
    },
    getProvider: (provider: string) => {
      return {
        naming: {
          getNormalizedFunctionName(functionName: string): string {
            return normalizeName(functionName.replace(/[-_]/g, ' '));
          },
        },
      };
    },
    service: {
      functions: {},
      getAllFunctions: () => {
        return Object.keys(this.serverless.service.functions);
      },
      provider: {
        compiledCloudFormationAliasTemplate: {
          Resources: {
            ApiGatewayStage: {
              Properties: {
                RestApiId: 'restApiId',
                StageName: 'stageName',
              },
            },
            EsLogsProcesserAlias: {
              Properties: {
                FunctionName: 'functionName',
              },
            },
          },
        },
        compiledCloudFormationTemplate: {
          Resources: {
            EsLogsProcesserLambdaFunction: {
              DependsOn: [],
              Properties: {},
            },
            IamRoleLambdaExecution: {
              DependsOn: [],
              Properties: {
                Policies: [],
              },
            },
          },
        },
        name: 'aws',
        region: 'us-east-1',
        runtime: 'nodejs8.10',
        stage: 'dev',
      },
    },
    version: '1.29.0',
  };

  constructor(private serverless?: any) {
    this.serverless = _.merge(this.defaults, serverless || {});
  }

  public build() {
    return this.serverless;
  }
}
