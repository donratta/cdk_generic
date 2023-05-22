#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { VpcStack } from '../lib/vpc-stack';
import { FargateStack } from '../lib/fargate-stack';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';

// GENERATE THE APP CONTEXT HERE
const app = new cdk.App();

// THESE ARE THE LIST OF THE ENVIRONMENT VARIABLES THAT WILL BE INJECTED INTO THE CONTAINER FOR ECS
const API_ENV_KEYS = [
];


// THE HOSTED ZONE ID FOR YOUR DOMAIN GOTTEN FROM ROUTE53
const DOMAIN_HOSTED_ZONE_ID = '';
const vpc = new VpcStack(app, 'vpc');


new DatabaseStack(app, 'sampleId/environment', {
    vpc: vpc.vpc,
    secretName: '', // The secret name from AWS Secrets Manager
    databaseName: 'postgres',
    subnetType: SubnetType.PRIVATE_ISOLATED,
});

new FargateStack(app, 'sanmple-app-name/environment', {
    vpc: vpc.vpc,
    clusterId: '',
    serviceId: '',
    memory: 1024,
    cpu: 512,
    instanceCount: 1,
    containerRepoName: '', // this is the repo name of the container in ECR,
    containerTag: '', // this is the tag of the container in ECR,
    healthCheckPath: '', // endpoint to check the health of the container,
    environmentSecretId: '', // secret name from AWS Secrets Manager,
    domainName: '', // the sub-domain you want to assign to the container,
    hostedZoneID: DOMAIN_HOSTED_ZONE_ID,
    zoneName: '', // the base domain name of the hosted zone eg. veloxpayments.co
    containerPort: 3000, // the port the container is listening on
    listOfKeys: API_ENV_KEYS
});



