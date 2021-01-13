"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateBuilder = void 0;
const lodash_1 = __importDefault(require("lodash"));
class TemplateBuilder {
    constructor(template) {
        this.template = template;
        this.defaultTemplate = {
            Resources: {},
        };
        this.template = lodash_1.default.merge(this.defaultTemplate, template || {});
    }
    withResource(logicalId, template) {
        this.template.Resources[logicalId] = template;
        return this;
    }
    build() {
        return this.template;
    }
}
exports.TemplateBuilder = TemplateBuilder;
//# sourceMappingURL=TemplateBuilder.js.map