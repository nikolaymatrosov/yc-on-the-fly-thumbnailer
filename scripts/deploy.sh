#!/bin/sh
source .env
yc serverless function create --name=$FUNCTION_NAME
if [[ ! -e "build" ]]; then
    mkdir "build"
fi

cp package.json ./build/package.json
npx tsc --build tsconfig.json
cp src/*.js ./build

export FUNCTION_ID=`yc serverless function get --name=thumbnail --format json | jq -r '.id'`
AWS_ACCESS_KEY=$AWS_ACCESS_KEY AWS_SECRET_KEY=$AWS_SECRET_KEY BUCKET=$BUCKET PREFIX=$PREFIX node scripts/setup.js

yc serverless function version create \
  --function-name=$FUNCTION_NAME \
  --runtime nodejs12-preview \
  --entrypoint index.handler \
  --memory 128m \
  --execution-timeout 30s \
  --source-path ./build\
  --environment AWS_ACCESS_KEY=$AWS_ACCESS_KEY,AWS_SECRET_KEY=$AWS_SECRET_KEY,BUCKET=$BUCKET,PREFIX=$PREFIX


