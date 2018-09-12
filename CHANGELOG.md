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
