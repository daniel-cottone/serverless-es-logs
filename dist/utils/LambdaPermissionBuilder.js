"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaPermissionBuilder = void 0;
const lodash_1 = __importDefault(require("lodash"));
class LambdaPermissionBuilder {
    constructor(template) {
        this.template = template;
        this.defaultTemplate = {
            Properties: {
                Action: 'lambda:InvokeFunction',
                SourceAccount: {
                    'Fn::Sub': '${AWS::AccountId}',
                },
            },
            Type: 'AWS::Lambda::Permission',
        };
        this.template = lodash_1.default.merge(this.defaultTemplate, template || {});
    }
    withAction(action) {
        this.template.Properties.Action = action;
        return this;
    }
    withFunctionName(functionName) {
        this.template.Properties.FunctionName = functionName;
        return this;
    }
    withPrincipal(principal) {
        this.template.Properties.Principal = principal;
        return this;
    }
    withSourceAccount(sourceAccount) {
        this.template.Properties.SourceAccount = sourceAccount;
        return this;
    }
    withSourceArn(sourceArn) {
        this.template.Properties.SourceArn = sourceArn;
        return this;
    }
    withDependsOn(dependsOn) {
        this.template.DependsOn = dependsOn;
        return this;
    }
    build() {
        const { Action, FunctionName, Principal, SourceAccount, SourceArn } = this.template.Properties;
        if (!Action || !FunctionName || !Principal || !SourceAccount || !SourceArn) {
            throw new Error('Missing a required property.');
        }
        return this.template;
    }
}
exports.LambdaPermissionBuilder = LambdaPermissionBuilder;
//# sourceMappingURL=LambdaPermissionBuilder.js.map