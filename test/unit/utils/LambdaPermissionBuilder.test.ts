import { expect } from 'chai';

import { LambdaPermissionBuilder } from '../../../src/utils';

describe('serverless-es-logs :: LambdaPermissionBuilder', () => {
  let builder: LambdaPermissionBuilder;

  beforeEach(() => {
    builder = new LambdaPermissionBuilder();
  });

  describe('#withAction()', () => {
    it('should return instance of LambdaPermissionBuilder', () => {
      expect(builder.withAction('action')).to.be.an.instanceOf(LambdaPermissionBuilder);
    });

    it('should set the lambda permission Action', () => {
      const template = builder
        .withAction('action')
        .withFunctionName('functionName')
        .withPrincipal('principal')
        .withSourceAccount('sourceAccount')
        .withSourceArn('sourceArn')
        .build();
      expect(template.Properties.Action).to.be.equal('action');
    });
  });

  describe('#withFunctionName()', () => {
    it('should return instance of LambdaPermissionBuilder', () => {
      expect(builder.withFunctionName('functionName')).to.be.an.instanceOf(LambdaPermissionBuilder);
    });

    it('should set the lambda permission FunctionName', () => {
      const template = builder
        .withAction('action')
        .withFunctionName('functionName')
        .withPrincipal('principal')
        .withSourceAccount('sourceAccount')
        .withSourceArn('sourceArn')
        .build();
      expect(template.Properties.FunctionName).to.be.equal('functionName');
    });
  });

  describe('#withPrincipal()', () => {
    it('should return instance of LambdaPermissionBuilder', () => {
      expect(builder.withPrincipal('principal')).to.be.an.instanceOf(LambdaPermissionBuilder);
    });

    it('should set the lambda permission Principal', () => {
      const template = builder
        .withAction('action')
        .withFunctionName('functionName')
        .withPrincipal('principal')
        .withSourceAccount('sourceAccount')
        .withSourceArn('sourceArn')
        .build();
      expect(template.Properties.Principal).to.be.equal('principal');
    });
  });

  describe('#withSourceAccount()', () => {
    it('should return instance of LambdaPermissionBuilder', () => {
      expect(builder.withSourceAccount('sourceAccount')).to.be.an.instanceOf(LambdaPermissionBuilder);
    });

    it('should set the lambda permission SourceAccount', () => {
      const template = builder
        .withAction('action')
        .withFunctionName('functionName')
        .withPrincipal('principal')
        .withSourceAccount('sourceAccount')
        .withSourceArn('sourceArn')
        .build();
      expect(template.Properties.SourceAccount).to.be.equal('sourceAccount');
    });
  });

  describe('#withSourceArn()', () => {
    it('should return instance of LambdaPermissionBuilder', () => {
      expect(builder.withSourceArn('sourceArn')).to.be.an.instanceOf(LambdaPermissionBuilder);
    });

    it('should set the lambda permission SourceArn', () => {
      const template = builder
        .withAction('action')
        .withFunctionName('functionName')
        .withPrincipal('principal')
        .withSourceAccount('sourceAccount')
        .withSourceArn('sourceArn')
        .build();
      expect(template.Properties.SourceArn).to.be.equal('sourceArn');
    });
  });

  describe('#withDependsOn()', () => {
    it('should return instance of LambdaPermissionBuilder', () => {
      expect(builder.withAction('action')).to.be.an.instanceOf(LambdaPermissionBuilder);
    });

    it('should set the lambda permission DependsOn', () => {
      const template = builder
        .withAction('action')
        .withFunctionName('functionName')
        .withPrincipal('principal')
        .withSourceAccount('sourceAccount')
        .withSourceArn('sourceArn')
        .withDependsOn([ 'dependsOn' ])
        .build();
      expect(template.DependsOn).to.be.deep.equal([ 'dependsOn' ]);
    });
  });

  describe('#build()', () => {
    it('should return the permission template', () => {
      const template = builder
        .withAction('action')
        .withFunctionName('functionName')
        .withPrincipal('principal')
        .withSourceAccount('sourceAccount')
        .withSourceArn('sourceArn')
        .withDependsOn(['dependsOn'])
        .build();
      expect(template).to.deep.equal({
        DependsOn: [ 'dependsOn' ],
        Properties: {
          Action: 'action',
          FunctionName: 'functionName',
          Principal: 'principal',
          SourceAccount: 'sourceAccount',
          SourceArn: 'sourceArn',
        },
        Type: 'AWS::Lambda::Permission',
      });
    });

    it('should throw error if missing required properties', () => {
      expect(builder.build.bind(builder)).to.throw(Error, 'Missing a required property.');
    });
  });
});
