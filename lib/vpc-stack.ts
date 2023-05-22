import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

export class VpcStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.vpc = new ec2.Vpc(this, 'my-vpc', {
            cidr: '10.0.0.0/16',
            natGateways: 1,
            maxAzs: 2,
            subnetConfiguration: [
                {
                    name: 'public-subnet-1',
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24
                },
                {
                    name: 'private-subnet-1',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
                    cidrMask: 24
                },
                {
                    name: 'private-subnet-2',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                    cidrMask: 24
                }
            ]
        });
    }
}
