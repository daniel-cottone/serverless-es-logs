import _ from 'lodash';

import { IFormatterOpts } from '../interfaces';

export function formatLogGroup(opts: IFormatterOpts): any {
  const { service, template } = opts;
  const deliveryStreamName = `${service}-es-logs`;
  const logGroupName = `/aws/kinesisfirehose/${deliveryStreamName}`;
  const newTemplate = _.cloneDeep(template);
  newTemplate.ServerlessEsLogsLogGroup.Properties.LogGroupName = logGroupName;
  return newTemplate;
}

export function formatIamFirehoseRole(opts: IFormatterOpts): any {
  const { service, stage, region, options = {}, template } = opts;
  const { domainArn } = options;
  const newTemplate = _.cloneDeep(template);
  const properties = newTemplate.ServerlessEsLogsIAMRole.Properties;
  properties.Policies[0].PolicyName['Fn::Join'][1] = [
    stage,
    service,
    'es-logs-s3-policy',
  ];
  properties.Policies[1].PolicyName['Fn::Join'][1] = [
    stage,
    service,
    'es-logs-es-policy',
  ];
  properties.Policies[1].PolicyDocument.Statement[0].Resource.push(domainArn, `${domainArn}/*`);
  properties.Policies[2].PolicyName['Fn::Join'][1] = [
    stage,
    service,
    'es-logs-cw-policy',
  ];
  properties.RoleName['Fn::Join'][1] = [
    service,
    stage,
    region,
    'es-logs-role',
  ];
  newTemplate.ServerlessEsLogsIAMRole.Properties = properties;
  return newTemplate;
}

export function formatFirehose(opts: IFormatterOpts): any {
  const { service, options = {}, template } = opts;
  const { domainArn, index } = options;
  const deliveryStreamName = `${service}-es-logs`;
  const newTemplate = _.cloneDeep(template);
  newTemplate.ServerlessEsLogsFirehose.Properties.DeliveryStreamName = deliveryStreamName;
  let esConfig = newTemplate.ServerlessEsLogsFirehose.Properties.ElasticsearchDestinationConfiguration;
  const { IndexName, TypeName, ...rest } = esConfig;
  esConfig = {
    ...rest,
    DomainARN: domainArn,
    IndexName: index || IndexName,
    TypeName: index || TypeName,
  };
  newTemplate.ServerlessEsLogsFirehose.Properties.ElasticsearchDestinationConfiguration = esConfig;
  return newTemplate;
}
