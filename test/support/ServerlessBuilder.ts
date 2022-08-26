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
        compiledCloudFormationTemplate: {
          Resources: {
            ApiGatewayLogGroup: {
              Properties: {
                LogGroupName: 'log-group-name',
              },
            },
            EsLogsProcesserLambdaFunction: {
              DependsOn: [],
              Properties: {
                FunctionName: 'functionName',
              },
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
        runtime: 'nodejs14.x',
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
