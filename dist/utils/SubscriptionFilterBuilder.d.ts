import { ITemplate, ITemplateProperty } from '../interfaces';
export declare class SubscriptionFilterBuilder {
    private template?;
    private readonly defaultTemplate;
    constructor(template?: ITemplate | undefined);
    withDestinationArn(destinationArn: ITemplateProperty): SubscriptionFilterBuilder;
    withFilterPattern(filterPattern: string): SubscriptionFilterBuilder;
    withLogGroupName(logGroupName: ITemplateProperty): SubscriptionFilterBuilder;
    withDependsOn(dependsOn: string[]): SubscriptionFilterBuilder;
    build(): ITemplate;
}
