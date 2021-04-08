import type { Serverless } from 'serverless/aws';

const instanceType = 't3.small.elasticsearch';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'elasticsearch-with-cognito',
  },
  frameworkVersion: '2',
  provider: {
    name: 'aws',
    region: 'ap-northeast-1',
  },
  resources: {
    Resources: {
      EsWithCognito: {
        Type: 'AWS::Elasticsearch::Domain',
        Properties: {
          ElasticsearchVersion: '7.7',
          DomainName: 'es-with-cognito',
          ElasticsearchClusterConfig: {
            DedicatedMasterEnabled: false,
            InstanceCount: '1',
            ZoneAwarenessEnabled: false,
            InstanceType: instanceType,
          },
          EBSOptions: {
            EBSEnabled: true,
            Iops: 0,
            VolumeSize: 10,
            VolumeType: 'gp2',
          },
          CognitoOptions: {
            Enabled: true,
            IdentityPoolId: '${cf:cognito-for-es-dev.EsAuthIdentityPoolId}',
            RoleArn:
              '${cf:cognito-for-es-dev.EsAuthCognitoAccessForAmazonESArn}',
            UserPoolId: '${cf:cognito-for-es-dev.EsAuthUserPoolId}',
          },
          AccessPolicies: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS: [
                    // todo 람다등 다른 aws 리소스에서 접근할경우에는 여기에 role이나 user를 추가필요.
                    {
                      'Fn::Join': [
                        '',
                        [
                          'arn:aws:iam::',
                          { Ref: 'AWS::AccountId' },
                          ':root',
                        ],
                      ],
                    },
                    '${cf:cognito-for-es-dev.EsAuthIdentityPoolAuthRoleArn}',
                  ],
                },
                Action: 'es:ESHttp*',
                Resource: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:aws:es:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':domain/*/*',
                    ],
                  ],
                },
              },
            ],
          },
        },
      },
    },
    Outputs: {
      DomainEndpoint: {
        Value: {
          'Fn::GetAtt': ['EsWithCognito', 'DomainEndpoint'],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
