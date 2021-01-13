"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionFilterBuilder = void 0;
const lodash_1 = __importDefault(require("lodash"));
class SubscriptionFilterBuilder {
    constructor(template) {
        this.template = template;
        this.defaultTemplate = {
            Properties: {},
            Type: 'AWS::Logs::SubscriptionFilter',
        };
        this.template = lodash_1.default.merge(this.defaultTemplate, template || {});
    }
    withDestinationArn(destinationArn) {
        this.template.Properties.DestinationArn = destinationArn;
        return this;
    }
    withFilterPattern(filterPattern) {
        this.template.Properties.FilterPattern = filterPattern;
        return this;
    }
    withLogGroupName(logGroupName) {
        this.template.Properties.LogGroupName = logGroupName;
        return this;
    }
    withDependsOn(dependsOn) {
        this.template.DependsOn = dependsOn;
        return this;
    }
    build() {
        const { DestinationArn, FilterPattern, LogGroupName } = this.template.Properties;
        if (!DestinationArn || !FilterPattern || !LogGroupName) {
            throw new Error('Missing a required property.');
        }
        return this.template;
    }
}
exports.SubscriptionFilterBuilder = SubscriptionFilterBuilder;
//# sourceMappingURL=SubscriptionFilterBuilder.js.map