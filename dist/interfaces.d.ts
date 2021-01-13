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
    template: {
        [name: string]: any;
    };
}
export declare type ITemplate = {
    [name: string]: any;
};
export declare type ITemplateProperty = string | ITemplate;
