import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class CartApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartLambda = new lambda.Function(this, 'CartApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      handler: 'lambda.handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_ENV: 'production',
      },
    });

    new apigateway.LambdaRestApi(this, 'CartApiGateway', {
      handler: cartLambda,
      restApiName: 'cart-api',
      proxy: true,
    });
  }
}
