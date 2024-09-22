import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Certificate, CertificateValidation} from 'aws-cdk-lib/aws-certificatemanager';
import {HostedZone} from 'aws-cdk-lib/aws-route53';

export type CertificateProps = StackProps & {
  domainName: string,
  subdomain: string,
};

export class CertificateStack extends Stack {
  public restApiCert: Certificate;
  public frontendCert: Certificate;

  constructor(scope: Construct, id: string, props: CertificateProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: props.domainName
    });
    this.restApiCert = new Certificate(this, 'rest-api-certificate', {
      domainName: `api.${props.subdomain}.${props.domainName}`,
      validation: CertificateValidation.fromDns(hostedZone)
    });
    this.frontendCert = new Certificate(this, 'frontend-certificate', {
      domainName: `app.${props.subdomain}.${props.domainName}`,
      validation: CertificateValidation.fromDns(hostedZone)
    });
  }
}
