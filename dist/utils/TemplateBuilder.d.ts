import { ITemplate } from '../interfaces';
export declare class TemplateBuilder {
    private template?;
    private readonly defaultTemplate;
    constructor(template?: ITemplate | undefined);
    withResource(logicalId: string, template: ITemplate): TemplateBuilder;
    build(): ITemplate;
}
