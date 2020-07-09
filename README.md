# serverless-es-logs

[![serverless][sls-image]][sls-url]
[![npm package][npm-image]][npm-url]
[![Build status][gh-action-image]][gh-action-url]
[![Coverage status][coveralls-image]][coveralls-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Renovate][renovate-image]][renovate-url]

A [Serverless][sls-url] plugin for transporting Cloudwatch log groups within your CloudFormation stack into Elasticsearch.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

Install the plugin in your project:
```bash
$ yarn add serverless-es-logs --dev
$ npm install serverless-es-logs --save-dev
```

Add the plugin to your `serverless.yml`:
```yaml
plugins:
  - serverless-es-logs
```

## Usage

Define your configuration using the `custom` configuration option in `serverless.yml`:

```yaml
custom:
  esLogs:
    endpoint: some-elasticsearch-endpoint.us-east-1.es.amazonaws.com
    index: some-index
```

Your logs will now be transported to the specified elasticsearch instance using the provided index.

### Options

#### apiGWFilterPattern

(Optional) The filter pattern that the Cloudwatch subscription should use for your API Gateway access
logs. Default is `[event]`, but you can override this to provide a pattern that will match your custom
access logs format. See
[Cloudwatch filter pattern syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html)
for more info.

```yaml
custom:
  esLogs:
    apiGWFilterPattern: '[request_timestamp, apigw_request_id, http_method, resource_path, request_status, response_latency]'

provider:
  logs:
    restApi:
      format: '$context.requestTimeEpoch $context.requestId $context.httpMethod $context.resourcePath $context.status $context.responseLatency'
```

#### endpoint

(Required) The endpoint of the Elasticsearch instance the logs should be transported to.

```yaml
custom:
  esLogs:
    endpoint: some-elasticsearch-endpoint.us-east-1.es.amazonaws.com
```

#### filterPattern

(Optional) The filter pattern that the Cloudwatch subscription should use for your lambda
functions. Default is `[timestamp=*Z, request_id="*-*", event]`. See
[Cloudwatch filter pattern syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html)
for more info.

```yaml
custom:
  esLogs:
    filterPattern: '[timestamp=*Z, request_id="*-*", event]'
```

#### includeApiGWLogs

(Optional) An option to capture access logs created by API Gateway and transport them to Elasticsearch.

```yaml
custom:
  esLogs:
    includeApiGWLogs: true

provider:
  name: aws
  logs:
    restApi: true
```

#### index

(Required) The Elasticsearch index that should be applied to the logs.

```yaml
custom:
  esLogs:
    index: some-index
```

#### indexDateSeparator

(Optional) The separator to use when creating the date suffix for the index. Default is `.`.

The format of the index will be: `<index>-YYYY<indexDateSeparator>MM<indexDateSeparator>DD`

```yaml
custom:
  esLogs:
    indexDateSeparator: '-'
```

This will result in a date like `2020-04-20`.

#### retentionInDays

(Optional) The number of days that Cloudwatch logs should persist. Default is to never expire.

```yaml
custom:
  esLogs:
    retentionInDays: 7
```

#### tags

(Optional) Custom tags that should be applied to every log message processed by this plugin and sent to elasticsearch as fields.

```yaml
custom:
  esLogs:
    tags:
      some_tag: something
      some_other_tag: something_else
```

#### useDefaultRole

(Optional) Override role management for the log processer lambda and use the manually specified default role. Default is false.

```yaml
custom:
  esLogs:
    useDefaultRole: true

provider:
  name: aws
  role: arn:aws:iam::123456789012:role/MyCustomRole
```

#### vpc

(Optional) VPC configuration for the log processor lambda to have.

```yaml
custom:
  esLogs:
    vpc: 
      securityGroupIds:
        - sg-123456789
      subnetIds:
        - subnet-123456789
        - subnet-223456789
        - subnet-323456789
```

#### xrayTracingPermissions

(Optional) Adds AWS Xray writing permissions to the processor lambda. You will need these if you enable tracing for ApiGateway on your service. 

```yaml
custom:
  esLogs:
    xrayTracingPermissions: true

provider:
  tracing:
    apiGateway: true
```

[sls-image]:http://public.serverless.com/badges/v3.svg
[sls-url]:http://www.serverless.com
[npm-image]:https://img.shields.io/npm/v/serverless-es-logs.svg
[npm-url]:https://www.npmjs.com/package/serverless-es-logs
[gh-action-image]:https://github.com/daniel-cottone/serverless-es-logs/workflows/Status%20check/badge.svg
[gh-action-url]:https://github.com/daniel-cottone/serverless-es-logs/actions?query=workflow%3A%22Status+check%22
[coveralls-image]:https://coveralls.io/repos/github/daniel-cottone/serverless-es-logs/badge.svg?branch=master
[coveralls-url]:https://coveralls.io/github/daniel-cottone/serverless-es-logs?branch=master
[snyk-image]:https://snyk.io/test/github/daniel-cottone/serverless-es-logs/badge.svg
[snyk-url]:https://snyk.io/test/github/daniel-cottone/serverless-es-logs
[renovate-image]:https://img.shields.io/badge/renovate-enabled-brightgreen.svg
[renovate-url]:https://renovatebot.com/
