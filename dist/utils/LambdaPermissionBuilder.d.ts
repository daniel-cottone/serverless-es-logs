import { ITemplate, ITemplateProperty } from '../interfaces';
export declare class LambdaPermissionBuilder {
    private template?;
    private readonly defaultTemplate;
    constructor(template?: ITemplate | undefined);
    withAction(action: string): LambdaPermissionBuilder;
    withFunctionName(functionName: ITemplateProperty): LambdaPermissionBuilder;
    withPrincipal(principal: ITemplateProperty): LambdaPermissionBuilder;
    withSourceAccount(sourceAccount: ITemplateProperty): LambdaPermissionBuilder;
    withSourceArn(sourceArn: ITemplateProperty): LambdaPermissionBuilder;
    withDependsOn(dependsOn: string[]): LambdaPermissionBuilder;
    build(): ITemplate;
}
