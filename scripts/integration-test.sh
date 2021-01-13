#!/bin/sh -e

yarn link
yarn link @getjerry/serverless-es-logs

for d in ./examples/*/; do
  cd $d
  sls package
  cd ../..
done

yarn unlink
