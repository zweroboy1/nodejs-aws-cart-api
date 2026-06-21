import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Handler, Context, Callback } from 'aws-lambda';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
import helmet from 'helmet';

import { AppModule } from './app.module';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
    const expressApp = express();
    expressApp.disable('x-powered-by');
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    app.enableCors({
        origin: (req, callback) => callback(null, true),
    });
    app.use(helmet());

    await app.init();
    return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
    event: any,
    context: Context,
    callback: Callback,
) => {
    if (!cachedServer) {
        cachedServer = await bootstrap();
    }
    return cachedServer(event, context, callback);
};
