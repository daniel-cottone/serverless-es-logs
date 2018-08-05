import _ from 'lodash';

import { ITemplate, ITemplateProperty } from '../interfaces';

export class LambdaPermissionBuilder {
  private readonly defaultTemplate: ITemplate = {
    Properties: {
      Action: 'lambda:InvokeFunction',
      SourceAccount: {
        'Fn::Sub': '${AWS::AccountId}',
      },
    },
    Type: 'AWS::Lambda::Permission',
  };

  constructor(private template?: ITemplate) {
    this.template = _.merge(this.defaultTemplate, template || {});
  }

  public withAction(action: string): LambdaPermissionBuilder {
    this.template!.Properties.Action = action;
    return this;
  }

  public withFunctionName(functionName: ITemplateProperty): LambdaPermissionBuilder {
    this.template!.Properties.FunctionName = functionName;
    return this;
  }

  public withPrincipal(principal: ITemplateProperty): LambdaPermissionBuilder {
    this.template!.Properties.Principal = principal;
    return this;
  }

  public withSourceAccount(sourceAccount: ITemplateProperty): LambdaPermissionBuilder {
    this.template!.Properties.SourceAccount = sourceAccount;
    return this;
  }

  public withSourceArn(sourceArn: ITemplateProperty): LambdaPermissionBuilder {
    this.template!.Properties.SourceArn = sourceArn;
    return this;
  }

  public withDependsOn(dependsOn: string[]): LambdaPermissionBuilder {
    this.template!.DependsOn = dependsOn;
    return this;
  }

  public build(): ITemplate {
    const { Action, FunctionName, Principal, SourceAccount, SourceArn } = this.template!.Properties;
    if (!Action || !FunctionName || !Principal || !SourceAccount || !SourceArn) {
      throw new Error('Missing a required property.');
    }
    return this.template as ITemplate;
  }
}
