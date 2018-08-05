import _ from 'lodash';

import { ITemplate, ITemplateProperty } from '../interfaces';

export class SubscriptionFilterBuilder {
  private readonly defaultTemplate: ITemplate = {
    Properties: {},
    Type: 'AWS::Logs::SubscriptionFilter',
  };

  constructor(private template?: ITemplate) {
    this.template = _.merge(this.defaultTemplate, template || {});
  }

  public withDestinationArn(destinationArn: ITemplateProperty): SubscriptionFilterBuilder {
    this.template!.Properties.DestinationArn = destinationArn;
    return this;
  }

  public withFilterPattern(filterPattern: string): SubscriptionFilterBuilder {
    this.template!.Properties.FilterPattern = filterPattern;
    return this;
  }

  public withLogGroupName(logGroupName: ITemplateProperty): SubscriptionFilterBuilder {
    this.template!.Properties.LogGroupName = logGroupName;
    return this;
  }

  public withDependsOn(dependsOn: string[]): SubscriptionFilterBuilder {
    this.template!.DependsOn = dependsOn;
    return this;
  }

  public build(): ITemplate {
    const { DestinationArn, FilterPattern, LogGroupName } = this.template!.Properties;
    if (!DestinationArn || !FilterPattern || !LogGroupName) {
      throw new Error('Missing a required property.');
    }
    return this.template as ITemplate;
  }
}
