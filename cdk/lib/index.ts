import cdk = require('@aws-cdk/core');
import sam = require('@aws-cdk/aws-sam');
import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');
import path = require('path');

const app = new cdk.App()
const stack = new cdk.Stack(app, 'CdkLambdaLayerDemo')

const EKSCTL_DEFAULT_VERSION = '0.9.0'

const samApp = new sam.CfnApplication(stack, 'SamLayer', {
  location: {
    applicationId: 'arn:aws:serverlessrepo:us-east-1:903779448426:applications/aws-lambda-layer-eksctl',
    semanticVersion: app.node.tryGetContext('eksctl_version') || EKSCTL_DEFAULT_VERSION
  },
  parameters: {
    LayerName: 'eksctl-layer'
  }
})


const layerVersionArn = samApp.getAtt('Outputs.LayerVersionArn').toString();

const handler = new lambda.Function(stack, 'Func', {
  code: lambda.AssetCode.fromAsset(path.join(__dirname, '../../', 'lambda_sample')),
  runtime: lambda.Runtime.PYTHON_3_7,
  handler: 'index.handler',
  timeout: cdk.Duration.seconds(60),
  memorySize: 512,
  layers: [
    lambda.LayerVersion.fromLayerVersionArn(stack, 'Layer', layerVersionArn)
  ]
})

new apigateway.LambdaRestApi(stack, 'Api', {
  handler
})

new cdk.CfnOutput(stack, 'LayerVersionArn', {
  value: layerVersionArn
})