import { expect } from 'chai';

import { TemplateBuilder } from '../../../src/utils';

describe('serverless-es-logs :: TemplateBuilder', () => {
  let builder: TemplateBuilder;

  beforeEach(() => {
    builder = new TemplateBuilder();
  });

  describe('#withResource()', () => {
    it('should return instance of TemplateBuilder', () => {
      expect(builder.withResource('resource', {})).to.be.an.instanceOf(TemplateBuilder);
    });

    it('should set the template resource', () => {
      const template = builder
        .withResource('resource', {})
        .build();
      expect(template).to.be.deep.equal({
        Resources: {
          resource: {},
        },
      });
    });
  });

  describe('#build()', () => {
    it('should return the built template', () => {
      const template = builder
        .withResource('resourceOne', {})
        .withResource('resourceTwo', {})
        .build();
      expect(template).to.be.deep.equal({
        Resources: {
          resourceOne: {},
          resourceTwo: {},
        },
      });
    });
  });
});
