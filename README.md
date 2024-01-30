# DLM Capital Infra as Code (CDK Typescript)

This project contains all the infrastructure as code we will need to provision services in our AWS account.

DLM AWS account ID: 963850480156

### How to set up you AWS account to use CDK
1. Get your AWS credentials from the account owner
2. Generate your access token
3. Add your access token and secret to you credentials file at ~/.aws/credentials
4. Install AWS  CDK. use this link https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html


## Bootstrap and run your CDK stack
1. First you must bootstrap the stack to run the environment
   - Run `aws-cdk bootstrap --profile {your credential profile}
2. You can now develop against the DLM stack
3. To see the difference between your changes and the cloud run.
   - ``cdk diff --profile {your aws profile name}``

Below are other useful commands you can use

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
