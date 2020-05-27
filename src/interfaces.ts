export interface IPluginOpts {
  domainArn?: string;
  index?: string;
  vpc?: {
      securityGroupIds: string[];
      subnetIds: string[];
  };
}

export interface IFormatterOpts {
  service: string;
  stage: string;
  region: string;
  options?: IPluginOpts;
  template: { [name: string]: any };
}

// tslint:disable-next-line:interface-over-type-literal
export type ITemplate = { [ name: string ]: any };
export type ITemplateProperty = string | ITemplate;
