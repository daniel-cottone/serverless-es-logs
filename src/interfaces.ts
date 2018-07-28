export interface IPluginOpts {
  domainArn?: string;
  index?: string;
}

export interface IFormatterOpts {
  service: string;
  stage: string;
  region: string;
  options?: IPluginOpts;
  template: { [name: string]: any };
}
