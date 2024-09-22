import {Duration, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Bucket} from 'aws-cdk-lib/aws-s3';
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment';
import {ARecord, HostedZone, RecordTarget} from 'aws-cdk-lib/aws-route53';
import {ICertificate} from 'aws-cdk-lib/aws-certificatemanager';
import {CachePolicy, Distribution} from 'aws-cdk-lib/aws-cloudfront';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins';
import {CloudFrontTarget} from 'aws-cdk-lib/aws-route53-targets';
import path from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

export type FrontendStackProps = {
  domainName: string,
  cert: ICertificate,
  subdomain: string,
} & StackProps;

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);
    const domainName = props.domainName;

    const bucket = new Bucket(this, 'spa-bucket', {
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }
    });

    new BucketDeployment(this, 'spa-deployment', {
      sources: [
        Source.asset(path.join(__dirname, '../../src/frontend/public'))
      ],
      destinationBucket: bucket
    });

    const hostedZone = HostedZone.fromLookup(this, 'hosted-zone', {domainName});

    const distribution = new Distribution(this, 'distro', {
      defaultRootObject: 'index.html',
      domainNames: [domainName],
      certificate: props.cert,
      defaultBehavior: {
        cachePolicy: new CachePolicy(this, 'caching', {
          defaultTtl: Duration.minutes(1)
        }),
        origin: new S3Origin(bucket)
      }
    });

    new ARecord(this, 'a-record', {
      zone: hostedZone,
      recordName: `app.${props.subdomain}.${props.domainName}`,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      ttl: Duration.minutes(1)
    });

  }
}
