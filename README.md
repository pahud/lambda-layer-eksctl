# lambda-layer-eksctl

**aws-lambda-layer-eksctl** is an [AWS Lambda Layer](https://docs.aws.amazon.com/en_us/lambda/latest/dg/configuration-layers.html) for `eksctl`.



## Build your own eksctl layer

```sh
# first, edit Makefile and set S3BUCKET to your own temporary stage bucket.
# build the layer.zip and VERSION file and save in your current directory
$ make build
# build the package
$ make sam-layer-package
# publish to SAR
$ make sam-layer-publish
# [optional] deploy this layer to your account/region
$ make sam-layer-deploy
```
This will build a lambda layer and mount `/opt/eksctl/eksctl` binary for your lambda sandbox when you attach this layer.


## Work with AWS CDK

check the CDK sample [here](cdk/lib/index.ts)

```bash
# deploy the sample stack
$ cd cdk
# compile .ts to .js
$ npm run build
# deploy the stack
$ cdk --app ./lib/index.js deploy
```

Outputs

```
Outputs:
CdkLambdaLayerDemo.ApiEndpoint4F160690 = https://knk0ad1pl8.execute-api.us-west-2.amazonaws.com/prod/
CdkLambdaLayerDemo.LayerVersionArn = arn:aws:lambda:us-west-2:112233445566:layer:eksctl-layer:1
```

curl the API URL to see the `eksctl version` output

```sh
$ curl https://knk0ad1pl8.execute-api.us-west-2.amazonaws.com/prod/
version.Info{BuiltAt:"", GitCommit:"", GitTag:"0.9.0"}'
```

