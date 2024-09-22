#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import { CertificateStack } from './certificate.js';

import {appName, domainName, subdomain} from './config.js';
import { RestApiStack } from './rest-api.js';
import {FrontendStack} from './frontend.js';

const app = new App();

const certStack = new CertificateStack(app, `${appName}-certificate-`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1'
    },
    crossRegionReferences: true,
    domainName,
    subdomain,
});

new RestApiStack(app, `${appName}-rest-api`, {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    crossRegionReferences: true,
    cert: certStack.restApiCert,
    domainName,
    subdomain,
});

new FrontendStack(app, `${appName}-frontend`, {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    crossRegionReferences: true,
    domainName,
    subdomain,
    cert: certStack.frontendCert
});
