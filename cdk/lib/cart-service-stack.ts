import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'node:path';

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
                DB_HOST: process.env.DB_HOST || '',
                DB_PORT: process.env.DB_PORT || '5432',
                DB_USER: process.env.DB_USER || 'postgres',
                DB_PASSWORD: process.env.DB_PASSWORD || '',
                DB_NAME: process.env.DB_NAME || 'postgres',
            },
        });

        new apigateway.LambdaRestApi(this, 'CartApiGateway', {
            handler: cartLambda,
            restApiName: 'cart-api',
            proxy: true,
        });
    }
}
