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
