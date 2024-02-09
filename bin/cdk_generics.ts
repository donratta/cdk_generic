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
const DOMAIN_HOSTED_ZONE_ID = 'Z039618222QNF7YZU8PIT';
const DOMAIN_ZONE_NAME = 'sofriwebservices.com';
const vpc = new VpcStack(app, 'vpc');


new DatabaseStack(app, 'effiflow-backend-stg', {
    vpc: vpc.vpc,
    secretName: 'stg/effiflow-backend/postgres', // The secret name from AWS Secrets Manager
    databaseName: 'postgres',
    subnetType: SubnetType.PRIVATE_ISOLATED,
});

new FargateStack(app, 'effiflow-backend-stg', {
    vpc: vpc.vpc,
    clusterId: 'effiflow-backend-stg-cluster',
    serviceId: 'effiflow-backend-stg-service',
    memory: 1024,
    cpu: 512,
    instanceCount: 1,
    containerRepoName: 'effiflow-backend',
    containerTag: 'initial',
    environmentSecretId: 'effiflow-backend-app/staging',
    domainName: 'stg.effiflow-backend.sofriwebservices.co',
    hostedZoneID: DOMAIN_HOSTED_ZONE_ID,
    zoneName: DOMAIN_ZONE_NAME,
    containerPort: 3000,
    listOfKeys: []
});




