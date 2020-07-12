# [3.4.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.3.1...v3.4.0) (2020-07-12)


### Features

* Support custom separator for date format of index ([#402](https://github.com/daniel-cottone/serverless-es-logs/issues/402)) ([7d164fd](https://github.com/daniel-cottone/serverless-es-logs/commit/7d164fd))

## [3.3.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.3.0...v3.3.1) (2020-07-09)


### Bug Fixes

* **deps:** update dependency lodash to v4.17.19 ([#428](https://github.com/daniel-cottone/serverless-es-logs/issues/428)) ([87f0c89](https://github.com/daniel-cottone/serverless-es-logs/commit/87f0c89))

# [3.3.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.2.2...v3.3.0) (2020-05-27)


### Features

* Add vpc configuration ([#416](https://github.com/daniel-cottone/serverless-es-logs/issues/416)) ([42994d3](https://github.com/daniel-cottone/serverless-es-logs/commit/42994d3))

## [3.2.2](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.2.1...v3.2.2) (2020-05-01)


### Bug Fixes

* **deps:** update dependency fs-extra to v9 ([#386](https://github.com/daniel-cottone/serverless-es-logs/issues/386)) ([f3e3185](https://github.com/daniel-cottone/serverless-es-logs/commit/f3e3185))

## [3.2.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.2.0...v3.2.1) (2020-05-01)


### Bug Fixes

* Supporting node >=10 ([88fce8c](https://github.com/daniel-cottone/serverless-es-logs/commit/88fce8c88a043fa93b35c3a4e11bcf2557fa0682))

# [3.2.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.1.1...v3.2.0) (2019-11-04)


### Features

* **API Gateway:** Supporting custom access log filters ([62cd23e](https://github.com/daniel-cottone/serverless-es-logs/commit/62cd23e))

## [3.1.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.1.0...v3.1.1) (2019-10-22)


### Bug Fixes

* **config:** Updating nodejs runtime to node10.x ([#313](https://github.com/daniel-cottone/serverless-es-logs/issues/313)) ([cce8b2a](https://github.com/daniel-cottone/serverless-es-logs/commit/cce8b2a))

# [3.1.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.0.3...v3.1.0) (2019-09-12)


### Features

* **xrayTracingPermissions:** Add aws permissions for api gateway tracing ([#287](https://github.com/daniel-cottone/serverless-es-logs/issues/287)) ([848999b](https://github.com/daniel-cottone/serverless-es-logs/commit/848999b))

## [3.0.3](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.0.2...v3.0.3) (2019-08-05)


### Bug Fixes

* **deps:** update dependency fs-extra to v8.1.0 ([#257](https://github.com/daniel-cottone/serverless-es-logs/issues/257)) ([b796ade](https://github.com/daniel-cottone/serverless-es-logs/commit/b796ade))
* **deps:** update dependency lodash to v4.17.14 ([#263](https://github.com/daniel-cottone/serverless-es-logs/issues/263)) ([d3b1f3d](https://github.com/daniel-cottone/serverless-es-logs/commit/d3b1f3d))
* **deps:** update dependency lodash to v4.17.15 ([#267](https://github.com/daniel-cottone/serverless-es-logs/issues/267)) ([1523f1a](https://github.com/daniel-cottone/serverless-es-logs/commit/1523f1a))

## [3.0.2](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.0.1...v3.0.2) (2019-05-23)


### Bug Fixes

* **package.json:** Adding templates to package dist ([3e30a9d](https://github.com/daniel-cottone/serverless-es-logs/commit/3e30a9d))

## [3.0.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v3.0.0...v3.0.1) (2019-05-19)


### Bug Fixes

* **filterPattern:** Fixing API Gateway filter pattern ([1e88822](https://github.com/daniel-cottone/serverless-es-logs/commit/1e88822))

# [3.0.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v2.3.1...v3.0.0) (2019-05-19)


### Features

* **api-gw-logging:** Support serverless native API GW logging ([#231](https://github.com/daniel-cottone/serverless-es-logs/issues/231)) ([4528fa3](https://github.com/daniel-cottone/serverless-es-logs/commit/4528fa3))


### BREAKING CHANGES

* **api-gw-logging:** Removing support for serverless-aws-alias plugin
This plugin is not being maintained. Furthermore, API Gateway logging
is now supported in serverless framework.

## [2.3.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v2.3.0...v2.3.1) (2019-05-19)


### Bug Fixes

* **package:** Excluding everything but dist from release ([d216fe5](https://github.com/daniel-cottone/serverless-es-logs/commit/d216fe5))

# [2.3.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v2.2.2...v2.3.0) (2019-05-18)


### Bug Fixes

* **deps:** update dependency fs-extra to v8 ([#225](https://github.com/daniel-cottone/serverless-es-logs/issues/225)) ([ea9e890](https://github.com/daniel-cottone/serverless-es-logs/commit/ea9e890))


### Features

* **useDefaultRole:** Add option to use specified default role ([a702116](https://github.com/daniel-cottone/serverless-es-logs/commit/a702116))

## [2.2.2](https://github.com/daniel-cottone/serverless-es-logs/compare/v2.2.1...v2.2.2) (2019-04-02)


### Bug Fixes

* Ensure this.custom refers to latest version of config ([7299e3d](https://github.com/daniel-cottone/serverless-es-logs/commit/7299e3d))

## [2.2.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v2.2.0...v2.2.1) (2019-02-22)


### Bug Fixes

* **deps:** Upgrading dependencies in lockfile ([#173](https://github.com/daniel-cottone/serverless-es-logs/issues/173)) ([004a753](https://github.com/daniel-cottone/serverless-es-logs/commit/004a753))

# [2.2.0](https://github.com/daniel-cottone/serverless-es-logs.git/compare/v2.1.0...v2.2.0) (2019-01-17)


### Features

* **logErrorContent:** log original log content when error occurs ([#144](https://github.com/daniel-cottone/serverless-es-logs.git/issues/144)) ([0784d6e](https://github.com/daniel-cottone/serverless-es-logs.git/commit/0784d6e))

# [2.1.0](https://github.com/daniel-cottone/serverless-es-logs.git/compare/v2.0.2...v2.1.0) (2018-12-06)


### Features

* **tags:** Add option to add tags to all logs sent to ES ([dda6837](https://github.com/daniel-cottone/serverless-es-logs.git/commit/dda6837))

## [2.0.2](https://github.com/daniel-cottone/serverless-es-logs.git/compare/v2.0.1...v2.0.2) (2018-11-08)


### Bug Fixes

* **deps:** update dependency fs-extra to v7.0.1 ([#96](https://github.com/daniel-cottone/serverless-es-logs.git/issues/96)) ([e5218b0](https://github.com/daniel-cottone/serverless-es-logs.git/commit/e5218b0))

## [2.0.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v2.0.0...v2.0.1) (2018-10-19)


### Bug Fixes

* **kibana:** Updating event field prefix ([ffd9af0](https://github.com/daniel-cottone/serverless-es-logs/commit/ffd9af0))

# [2.0.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.2.0...v2.0.0) (2018-10-02)


### Bug Fixes

* **logsToEs:** Fixed ES '_type' attribute ([dc5b849](https://github.com/daniel-cottone/serverless-es-logs/commit/dc5b849)), closes [#65](https://github.com/daniel-cottone/serverless-es-logs/issues/65)


### BREAKING CHANGES

* **logsToEs:** The '_type' attribute is now hardcoded to
'serverless-es-logs' instead of the name of the Cloudwatch
log group.

For any users of Elasticsearch 6.x this change will result
in an error for the current index.

# [1.2.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.1.3...v1.2.0) (2018-09-17)


### Features

* **filterPattern:** Adding option for overriding default filter pattern ([e2065bd](https://github.com/daniel-cottone/serverless-es-logs/commit/e2065bd))

## [1.1.3](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.1.2...v1.1.3) (2018-09-13)


### Bug Fixes

* **logsToEs:** Stripping extra parens from apigw_request_id ([b9f74b6](https://github.com/daniel-cottone/serverless-es-logs/commit/b9f74b6))

## [1.1.2](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.1.1...v1.1.2) (2018-09-12)


### Bug Fixes

* **deps:** update dependency lodash to v4.17.11 ([#45](https://github.com/daniel-cottone/serverless-es-logs/issues/45)) ([87d26a6](https://github.com/daniel-cottone/serverless-es-logs/commit/87d26a6))

## [1.1.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.1.0...v1.1.1) (2018-08-15)


### Bug Fixes

* **IAM:** Attaching ES policy when no default role given ([caebcc0](https://github.com/daniel-cottone/serverless-es-logs/commit/caebcc0))

# [1.1.0](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.0.3...v1.1.0) (2018-08-05)


### Features

* **includeApiGWLogs:** Adding support for API Gateway logs. Fixes [#10](https://github.com/daniel-cottone/serverless-es-logs/issues/10) ([#15](https://github.com/daniel-cottone/serverless-es-logs/issues/15)) ([dd7fddd](https://github.com/daniel-cottone/serverless-es-logs/commit/dd7fddd))
* **retentionInDays:** Adding option for setting Cloudwatch log retention. Fixes [#11](https://github.com/daniel-cottone/serverless-es-logs/issues/11) ([#16](https://github.com/daniel-cottone/serverless-es-logs/issues/16)) ([c1d1ad2](https://github.com/daniel-cottone/serverless-es-logs/commit/c1d1ad2))

## [1.0.3](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.0.2...v1.0.3) (2018-08-03)


### Bug Fixes

* Cleaning up code and adding tests ([20e8437](https://github.com/daniel-cottone/serverless-es-logs/commit/20e8437))
* **options:** Adding validation for plugin options ([c45aad0](https://github.com/daniel-cottone/serverless-es-logs/commit/c45aad0))

## [1.0.2](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.0.1...v1.0.2) (2018-08-02)


### Bug Fixes

* **xray:** Removing IAM role permissions for xray and disabling tracing on function ([80fdedb](https://github.com/daniel-cottone/serverless-es-logs/commit/80fdedb))

## [1.0.1](https://github.com/daniel-cottone/serverless-es-logs/compare/v1.0.0...v1.0.1) (2018-08-02)


### Bug Fixes

* **iam-lambda:** Adding XRay policy to log lambda IAM role ([9fd8e50](https://github.com/daniel-cottone/serverless-es-logs/commit/9fd8e50))
* **patchLogProcesserRole:** Removing reference to default role ([49fe9d7](https://github.com/daniel-cottone/serverless-es-logs/commit/49fe9d7))

# 1.0.0 (2018-08-02)


### Bug Fixes

* **lint:** Fixing lint errors ([0ef0852](https://github.com/daniel-cottone/serverless-es-logs/commit/0ef0852))
* **lint:** Fixing linting issues ([313957f](https://github.com/daniel-cottone/serverless-es-logs/commit/313957f))
* **logProcesser:** Updating log processer logic and role policies ([eca181d](https://github.com/daniel-cottone/serverless-es-logs/commit/eca181d))


### Features

* Adding log processer lambda to firehose ([205b1a0](https://github.com/daniel-cottone/serverless-es-logs/commit/205b1a0))
* Implementing logging using lambda to es ([e64f4bf](https://github.com/daniel-cottone/serverless-es-logs/commit/e64f4bf))
* Initial implementation ([911d2df](https://github.com/daniel-cottone/serverless-es-logs/commit/911d2df))
* Updating iam firehose policy ([c6f706a](https://github.com/daniel-cottone/serverless-es-logs/commit/c6f706a))
