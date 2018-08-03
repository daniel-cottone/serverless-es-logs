import { expect } from 'chai';

import ServerlessEsLogsPlugin from '../../src';
import { ServerlessBuilder } from '../support';

// tslint:disable
describe('serverless-es-logs :: Plugin tests', () => {
  let serverless: any;
  let options: { [name: string]: any };
  let plugin: ServerlessEsLogsPlugin;

  beforeEach(() => {
    serverless = new ServerlessBuilder().build();
    plugin = new ServerlessEsLogsPlugin(serverless, options);
  });

  describe('#hooks', () => {
    describe('after:package:initialize', () => {
      it('should exist', () => {
        expect(plugin.hooks['after:package:initialize']).to.exist;
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