import cdk = require('@aws-cdk/core');
import sam = require('@aws-cdk/aws-sam');
import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');
import eks = require('@aws-cdk/aws-eks');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import cr = require('@aws-cdk/custom-resources');
import cfn = require('@aws-cdk/aws-cloudformation');
import path = require('path');

const app = new cdk.App()

const env = {
  region: app.node.tryGetContext('region') || process.env.CDK_INTEG_REGION || process.env.CDK_DEFAULT_REGION,
  account: app.node.tryGetContext('account') || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
};


const stack = new cdk.Stack(app, 'EksctlLambdaLayerDemo', { env })

const EKSCTL_DEFAULT_VERSION = '0.10.1'

const vpc = ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true });

const clusterAdmin = new iam.Role(stack, 'AdminRole', {
  assumedBy: new iam.AccountRootPrincipal()
});

// default cluster with nodegroup of two m5.large instances
const cluster = new eks.Cluster(stack, 'Cluster', {
  vpc,
  mastersRole: clusterAdmin,
});

/**
 * lambda-layer-eksctl
 */

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
const eksctlLayer = lambda.LayerVersion.fromLayerVersionArn(stack, 'Layer', layerVersionArn)

/**
 * custom-resources handler to create resource from eksctl-lambda-layer
 */

const onEvent = new lambda.Function(stack, 'MyHandler', {
  code: lambda.AssetCode.fromAsset(path.join(__dirname, '../../', 'lambda_sample')),
  runtime: lambda.Runtime.PYTHON_3_7,
  handler: 'index.on_event',
  timeout: cdk.Duration.seconds(60),
  memorySize: 512,
  layers: [
    eksctlLayer
  ]
}
);

const myProvider = new cr.Provider(stack, 'MyProvider', {
  onEventHandler: onEvent,
  // isCompleteHandler: isComplete // optional async "waiter"
});

const eksctlResource = new cfn.CustomResource(stack, 'Resource1', {
  provider: myProvider,
  properties: {
    foo: 'bar123'
  }
});
const eksctlOutput = eksctlResource.getAttString('result')

const handler = new lambda.Function(stack, 'Func', {
  code: lambda.AssetCode.fromAsset(path.join(__dirname, '../../', 'lambda_sample')),
  runtime: lambda.Runtime.PYTHON_3_7,
  handler: 'index.handler',
  timeout: cdk.Duration.seconds(60),
  memorySize: 512,
  layers: [
    eksctlLayer
  ]
})

new apigateway.LambdaRestApi(stack, 'Api', {
  handler
})

new cdk.CfnOutput(stack, 'LayerVersionArn', {
  value: layerVersionArn
})

new cdk.CfnOutput(stack, 'eksctlOutput', {
  value: eksctlOutput.toString()
})
