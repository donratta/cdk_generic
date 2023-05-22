import * as cdk from 'aws-cdk-lib';
import {
    aws_ec2,
    aws_ec2 as ec2,
    aws_ecr as ecr,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns, aws_rds,
    aws_route53
} from 'aws-cdk-lib';
import { ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';

export interface FargateStackProps extends cdk.StackProps {
    vpc: ec2.Vpc,
    clusterId: string;
    serviceId: string;
    memory: number;
    cpu: number;
    instanceCount: number;
    environmentSecretId: string;
    containerRepoName: string;
    containerTag?: string;
    healthCheckPath?: string;
    domainName: string;
    hostedZoneID: string;
    zoneName: string;
    containerPort: number;
    listOfKeys: string[];
}

export class FargateStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: FargateStackProps) {
        super(scope, id, props);
        // create the cluster as needed
        const cluster = new ecs.Cluster(this, props.clusterId, {
            vpc: props.vpc
        });


        // generate the secrets by going through the list of keys and grabbing the secret from the secret manager
        const fargateSecrets: { [key: string]: ecs.Secret } = {}
        props.listOfKeys.forEach(secretKey => {
            const ecsSecret: ISecret = Secret.fromSecretNameV2(this,    `fargate-stack-${id}-${secretKey}`, props.environmentSecretId);
            fargateSecrets[secretKey] = ecs.Secret.fromSecretsManager(ecsSecret, secretKey);
        });

        const repo = ecr.Repository.fromRepositoryName(this, 'repo', props.containerRepoName);
        const hostedZone = aws_route53.HostedZone.fromHostedZoneAttributes(this, 'hosted-zone-name', { hostedZoneId: props.hostedZoneID, zoneName: props.zoneName });
        // create the fargate service01
        const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, props.serviceId, {
            cluster,
            memoryLimitMiB: props.memory,
            cpu: props.cpu,
            desiredCount: props.instanceCount,
            maxHealthyPercent: 200,
            minHealthyPercent: 100,
            taskImageOptions: {
                image: ecs.EcrImage.fromEcrRepository(repo, props.containerTag),
                containerPort: props.containerPort,
                secrets: fargateSecrets
            },
            taskSubnets: {
                subnets: props.vpc.privateSubnets
            },
            listenerPort: 443,
            protocol: ApplicationProtocol.HTTPS,
            domainName: props.domainName,
            domainZone: hostedZone
        });

        // attach health check to the load balancer if we have a health path passed in
        if (props.healthCheckPath) {
            fargateService.targetGroup.configureHealthCheck({ path: props.healthCheckPath });
        }

        // output the URL of the load balancer
        new cdk.CfnOutput(this, `${id}-loadBalancerURL`, {
            value: fargateService.loadBalancer.loadBalancerDnsName,
            exportName: `${id}-loadBalancerURL`
        });
    }
}
