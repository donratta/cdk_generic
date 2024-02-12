#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { VpcStack } from '../lib/vpc-stack';
import { FargateStack } from '../lib/fargate-stack';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';

// GENERATE THE APP CONTEXT HERE
const app = new cdk.App();
const DEFAULT_ENV = { region: 'eu-west-2', account: '963850480156' };

// THESE ARE THE LIST OF THE ENVIRONMENT VARIABLES THAT WILL BE INJECTED INTO THE CONTAINER FOR ECS
const EFFIFLOW_BACKEND_API_KEYS = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB'
];


// THE HOSTED ZONE ID FOR YOUR DOMAIN GOTTEN FROM ROUTE53
const DOMAIN_HOSTED_ZONE_ID = 'Z039618222QNF7YZU8PIT';
const DOMAIN_ZONE_NAME = 'sofriwebservices.com';
const vpc = new VpcStack(app, 'vpc', { env: DEFAULT_ENV });


new DatabaseStack(app, 'effiflow-backend-postgres-stg', {
    vpc: vpc.vpc,
    secretName: 'stg/effiflow-backend/postgres', // The secret name from AWS Secrets Manager
    databaseName: 'postgres',
    subnetType: SubnetType.PRIVATE_ISOLATED,
    env: DEFAULT_ENV
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
    environmentSecretId: 'stg/effiflow-backend-api',
    domainName: 'stg.effiflow-backend.sofriwebservices.com',
    hostedZoneID: DOMAIN_HOSTED_ZONE_ID,
    zoneName: DOMAIN_ZONE_NAME,
    containerPort: 3000,
    listOfKeys: EFFIFLOW_BACKEND_API_KEYS,
    healthCheckPath: '/',
    env: DEFAULT_ENV
});

new FargateStack(app, 'effiflow-frontend-stg', {
    vpc: vpc.vpc,
    clusterId: 'effiflow-frontend-stg-cluster',
    serviceId: 'effiflow-frontend-stg-service',
    memory: 1024,
    cpu: 512,
    instanceCount: 1,
    containerRepoName: 'effiflow-frontend',
    containerTag: 'initial',
    environmentSecretId: '',
    domainName: 'stg.effiflow.sofriwebservices.com',
    hostedZoneID: DOMAIN_HOSTED_ZONE_ID,
    zoneName: DOMAIN_ZONE_NAME,
    containerPort: 80,
    listOfKeys: [],
    healthCheckPath: '/',
    env: DEFAULT_ENV
});
