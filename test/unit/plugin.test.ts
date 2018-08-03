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

  describe('#constructor()', () => {
    it('should initialize plugin', () => {
      expect(plugin).to.be.an.instanceOf(ServerlessEsLogsPlugin);
    });
  });
});