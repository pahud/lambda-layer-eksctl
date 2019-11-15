# lambda-layer-eksctl

**lambda-layer-eksctl** is an [AWS Lambda Layer](https://docs.aws.amazon.com/en_us/lambda/latest/dg/configuration-layers.html) for `eksctl`.



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
# install all required packages from package.json
$ npm i
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

## Work with custom-resources provider framework
AWS CDK custom-resources construct library offers a very powerful [provider framework](https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/custom-resources/README.md#provider-framework) to help you define your own custom resource handler and do almost anything beyond the native cloudformation or AWS API/SDK can do. By using **lambda-layer-eksctl** we can easily create our layer from SAR with @aws-eks/aws-sam and build our custom handler lambda function to execute `eksctl` command in the onEvent() handler. Check the CDK sample code [here](https://github.com/pahud/lambda-layer-eksctl/blob/552ff1986ddf1744fef2d243af2cce58df81ee8d/cdk/lib/index.ts#L36-L80) and the custom python handler [here](lambda_sample/index.py) for details.

When you deploy this stack, you will be able to see the output as below and that was the `eksctl version` command output from within the Lambda function.

```
EksctlLambdaLayerDemo.eksctlOutput = version.Info{BuiltAt:"", GitCommit:"", GitTag:"0.9.0"}'
```

In this case, you can leverage the powerful `provider framework` to do almost anything `eksctl` can do for you in AWS CDK.



