import { expect } from 'chai';

import ServerlessEsLogsPlugin from '../../src';
import { ServerlessBuilder } from '../support';

// tslint:disable
describe('serverless-es-logs :: Plugin tests', () => {
  const defaultOptions = {
    service: {
      custom: {
        esLogs: {
          endpoint: 'some_endpoint',
          index: 'some_index',
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

  describe('#hooks', () => {
    describe('after:package:initialize', () => {
      it('should exist', () => {
        expect(plugin.hooks['after:package:initialize']).to.exist;
      });

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
    });

    describe('after:package:createDeploymentArtifacts', () => {
      it('should exist', () => {
        expect(plugin.hooks['after:package:createDeploymentArtifacts']).to.exist;
      });
    });

    describe('aws:package:finalize:mergeCustomProviderResources', () => {
      it('should exist', () => {
        expect(plugin.hooks['aws:package:finalize:mergeCustomProviderResources']).to.exist;
      });
    });
  });

  describe('#constructor()', () => {
    it('should initialize plugin', () => {
      expect(plugin).to.be.an.instanceOf(ServerlessEsLogsPlugin);
    });
  });
});