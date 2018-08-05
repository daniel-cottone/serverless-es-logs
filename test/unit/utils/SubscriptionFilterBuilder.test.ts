import { expect } from 'chai';

import { SubscriptionFilterBuilder } from '../../../src/utils';

describe('serverless-es-logs :: SubscriptionFilterBuilder', () => {
  let builder: SubscriptionFilterBuilder;

  beforeEach(() => {
    builder = new SubscriptionFilterBuilder();
  });

  describe('#withDestinationArn()', () => {
    it('should return instance of SubscriptionFilterBuilder', () => {
      expect(builder.withDestinationArn('destinationArn')).to.be.an.instanceOf(SubscriptionFilterBuilder);
    });

    it('should set the subscription filter DestinationArn', () => {
      const template = builder
        .withDestinationArn('destinationArn')
        .withFilterPattern('filterPattern')
        .withLogGroupName('logGroupName')
        .build();
      expect(template.Properties.DestinationArn).to.be.equal('destinationArn');
    });
  });

  describe('#withFilterPattern()', () => {
    it('should return instance of SubscriptionFilterBuilder', () => {
      expect(builder.withFilterPattern('filterPattern')).to.be.an.instanceOf(SubscriptionFilterBuilder);
    });

    it('should set the subscription filter FilterPattern', () => {
      const template = builder
        .withDestinationArn('destinationArn')
        .withFilterPattern('filterPattern')
        .withLogGroupName('logGroupName')
        .build();
      expect(template.Properties.FilterPattern).to.be.equal('filterPattern');
    });
  });

  describe('#withLogGroupName()', () => {
    it('should return instance of SubscriptionFilterBuilder', () => {
      expect(builder.withLogGroupName('logGroupName')).to.be.an.instanceOf(SubscriptionFilterBuilder);
    });

    it('should set the subscription filter LogGroupName', () => {
      const template = builder
        .withDestinationArn('destinationArn')
        .withFilterPattern('filterPattern')
        .withLogGroupName('logGroupName')
        .build();
      expect(template.Properties.LogGroupName).to.be.equal('logGroupName');
    });
  });

  describe('#withDependsOn()', () => {
    it('should return instance of SubscriptionFilterBuilder', () => {
      expect(builder.withDependsOn([ 'dependsOn' ])).to.be.an.instanceOf(SubscriptionFilterBuilder);
    });

    it('should set the lambda permission DependsOn', () => {
      const template = builder
        .withDestinationArn('destinationArn')
        .withFilterPattern('filterPattern')
        .withLogGroupName('logGroupName')
        .withDependsOn([ 'dependsOn' ])
        .build();
      expect(template.DependsOn).to.be.deep.equal([ 'dependsOn' ]);
    });
  });

  describe('#build()', () => {
    it('should return the permission template', () => {
      const template = builder
        .withDestinationArn('destinationArn')
        .withFilterPattern('filterPattern')
        .withLogGroupName('logGroupName')
        .withDependsOn(['dependsOn'])
        .build();
      expect(template).to.deep.equal({
        DependsOn: [ 'dependsOn' ],
        Properties: {
          DestinationArn: 'destinationArn',
          FilterPattern: 'filterPattern',
          LogGroupName: 'logGroupName',
        },
        Type: 'AWS::Logs::SubscriptionFilter',
      });
    });

    it('should throw error if missing required properties', () => {
      expect(builder.build.bind(builder)).to.throw(Error, 'Missing a required property.');
    });
  });
});
