#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import { CertificateStack } from './certificate.stack.js';

import {appName, domainName, stage, subdomain} from './config.js';
import { RestApiStack } from './rest-api.stack.js';

const app = new App();

const certStack = new CertificateStack(app, `${appName}-certificate-${stage}`, {
    stage,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1'
    },
    crossRegionReferences: true,
    domainName,
    subdomain,
});

new RestApiStack(app, `${appName}-rest-api-${stage}`, {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    crossRegionReferences: true,
    stage,
    certStack,
    domainName,
    subdomain,
});
