import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import * as path from 'path';
import {Construct} from 'constructs';
import {Cors, EndpointType, LambdaIntegration, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {ARecord, HostedZone, RecordTarget} from 'aws-cdk-lib/aws-route53';
import {ApiGateway} from 'aws-cdk-lib/aws-route53-targets';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {bundlingOptions, nodeRuntime} from './config.js';
import {ICertificate} from 'aws-cdk-lib/aws-certificatemanager';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export type RestApiStackProps = StackProps & {
  cert: ICertificate,
  subdomain: string,
  domainName: string,
};

export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, `${id}-rest-api-handler`, {
      entry: path.join(__dirname, '../rest-api/handler.js'),
      handler: 'handler',
      timeout: Duration.seconds(15),
      runtime: nodeRuntime,
      bundling: bundlingOptions
    });

    const lambdaIntegration = new LambdaIntegration(fn);

    const api = new RestApi(this, `${id}-gateway`, {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS
      },
    });

    api.root.addProxy({defaultIntegration: lambdaIntegration});

    api.addDomainName('domain-name', {
      domainName: `api.${props.subdomain}.${props.domainName}`,
      certificate: props.cert,
      endpointType: EndpointType.EDGE
    });

    new ARecord(this, 'a-record', {
      recordName: `api.${props.subdomain}.${props.domainName}`,
      target: RecordTarget.fromAlias(new ApiGateway(api)),
      zone: HostedZone.fromLookup(this, 'hosted-zone', {
        domainName: props.domainName
      })
    });

  }
}
