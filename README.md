# serverless-es-logs

[![serverless][sls-image]][sls-url]
[![npm package][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Renovate][renovate-image]][renovate-url]

A [Serverless][sls-url] plugin for transporting Cloudwatch log groups within your CloudFormation stack into Elasticsearch.

## Table of Contents

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

[sls-image]:http://public.serverless.com/badges/v3.svg
[sls-url]:http://www.serverless.com
[npm-image]:https://img.shields.io/npm/v/serverless-es-logs.svg
[npm-url]:https://www.npmjs.com/package/serverless-es-logs
[travis-image]:https://travis-ci.org/daniel-cottone/serverless-es-logs.svg?branch=master
[travis-url]:https://travis-ci.org/daniel-cottone/serverless-es-logs
[renovate-image]:https://img.shields.io/badge/renovate-enabled-brightgreen.svg
[renovate-url]:https://renovatebot.com/
