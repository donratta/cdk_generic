import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2, aws_rds, RemovalPolicy } from 'aws-cdk-lib';
import {MysqlEngineVersion, PostgresEngineVersion, StorageType} from 'aws-cdk-lib/aws-rds';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds/lib/instance';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export interface DatabaseStackProps extends cdk.StackProps {
  databaseName: string;
  secretName: string;
  vpc: ec2.Vpc;
  subnetType: SubnetType;
  engineType?: 'mysql' | 'postgres';
}
export class DatabaseStack extends cdk.Stack {
    readonly databaseInstance: DatabaseInstance;
    constructor(scope: cdk.App, id: string, props: DatabaseStackProps) {
        super(scope, id, props);
        const secret = Secret.fromSecretNameV2(this, `${id}-database-username`, props.secretName);
        const engine = props.engineType === 'mysql' ? aws_rds.DatabaseInstanceEngine.mysql({ version: '8.0.36' as any }) :
            aws_rds.DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_13_8 });
        const username = secret.secretValueFromJson('username').unsafeUnwrap().toString();
        const password = secret.secretValueFromJson('password');

        // create the master secret details
        const databaseProps: DatabaseInstanceProps = {
            engine,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO
            ),
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: props.subnetType
            },
            storageType: StorageType.GP2,
            deletionProtection: true,
            storageEncrypted: true,
            port: props.engineType === 'postgres' ? 5432:3306,
            databaseName: props.databaseName,
            credentials: {
                username,
                password,
            },
            removalPolicy: RemovalPolicy.SNAPSHOT
        };
        const databaseInstance = new aws_rds.DatabaseInstance(this, `${id}-instance`, databaseProps);
        this.databaseInstance = databaseInstance;
        new cdk.CfnOutput(this, 'dbEndpoint', {
            value: databaseInstance.instanceEndpoint.hostname,
        });
        databaseInstance.connections.allowDefaultPortFromAnyIpv4();
    }
}
