import _ from 'lodash';

import { ITemplate } from '../interfaces';

export class TemplateBuilder {
  private readonly defaultTemplate = {
    Resources: {},
  };

  constructor(private template?: ITemplate) {
    this.template = _.merge(this.defaultTemplate, template || {});
  }

  public withResource(logicalId: string, template: ITemplate): TemplateBuilder {
    this.template!.Resources[logicalId] = template;
    return this;
  }

  public build(): ITemplate {
    return this.template as ITemplate;
  }
}
