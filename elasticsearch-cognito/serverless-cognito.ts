import type { Serverless } from 'serverless/aws';
const serverlessConfiguration: Serverless = {
    service: {
      name: 'cognito-for-es',
    },
    frameworkVersion: '2',
    provider: {
      name: 'aws',
      region: 'ap-northeast-1',
    },
    resources: {
      Resources: {
        EsAuthUserPool: {
          Type: 'AWS::Cognito::UserPool',
          Properties: {
            UserPoolName: 'es-auth-user-pool',
            AdminCreateUserConfig: {
              AllowAdminCreateUserOnly: true,
            },
            UsernameAttributes: ['email'],
            Policies: {
              PasswordPolicy: {
                MinimumLength: 8,
                RequireLowercase: false,
                RequireNumbers: true,
                RequireSymbols: false,
                RequireUppercase: false,
              },
            },
          },
        },
        EsAuthUserPoolClient: {
          Type: 'AWS::Cognito::UserPoolClient',
          Properties: {
            ClientName: 'es-auth-user-pool-client',
            UserPoolId: {
              Ref: 'EsAuthUserPool',
            },
          },
        },
        EsAuthUserPoolDomain: {
          Type: 'AWS::Cognito::UserPoolDomain',
          Properties: {
            Domain: 'test-12i89sdfh-es', // todo unique domain
            UserPoolId: {
              Ref: 'EsAuthUserPool',
            },
          },
        },
        EsAuthIdentityPool: {
          Type: 'AWS::Cognito::IdentityPool',
          Properties: {
            AllowClassicFlow: false,
            AllowUnauthenticatedIdentities: true,
            IdentityPoolName: 'es-auth-identity-pool',
            CognitoIdentityProviders: [
              {
                ClientId: { Ref: 'EsAuthUserPoolClient' },
                ProviderName: {
                  'Fn::Join': [
                    '',
                    [
                      'cognito-idp.',
                      { Ref: 'AWS::Region' },
                      '.amazonaws.com/',
                      { Ref: 'EsAuthUserPool' },
                    ],
                  ],
                },
              },
            ],
          },
        },
        EsAuthIdentityPoolUnAuthRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: 'sts:AssumeRoleWithWebIdentity',
                  Principal: {
                    Federated: 'cognito-identity.amazonaws.com',
                  },
                  Condition: {
                    StringEquals: {
                      'cognito-identity.amazonaws.com:aud': {
                        Ref: 'EsAuthIdentityPool',
                      },
                    },
                    'ForAnyValue:StringLike': {
                      'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                    },
                  },
                },
              ],
            },
            ManagedPolicyArns: [
              {
                Ref: 'EsAuthIdentityPoolUnAuthPolicy',
              },
            ],
          },
        },
        EsAuthIdentityPoolUnAuthPolicy: {
          Type: 'AWS::IAM::ManagedPolicy',
          Properties: {
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: ['mobileanalytics:PutEvents', 'cognito-sync:*'],
                  Resource: '*',
                },
              ],
            },
          },
        },
        EsAuthIdentityPoolAuthRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: 'sts:AssumeRoleWithWebIdentity',
                  Principal: {
                    Federated: 'cognito-identity.amazonaws.com',
                  },
                  Condition: {
                    StringEquals: {
                      'cognito-identity.amazonaws.com:aud': {
                        Ref: 'EsAuthIdentityPool',
                      },
                    },
                    'ForAnyValue:StringLike': {
                      'cognito-identity.amazonaws.com:amr': 'authenticated',
                    },
                  },
                },
              ],
            },
            ManagedPolicyArns: [
              {
                Ref: 'EsAuthIdentityPoolAuthPolicy',
              },
            ],
          },
        },
        EsAuthIdentityPoolAuthPolicy: {
          Type: 'AWS::IAM::ManagedPolicy',
          Properties: {
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: [
                    'mobileanalytics:PutEvents',
                    'cognito-sync:*',
                    'cognito-identity:*',
                  ],
                  Resource: '*',
                },
              ],
            },
          },
        },
        EsAuthCognitoAccessForAmazonES: {
          Type: 'AWS::IAM::Role',
          Properties: {
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: {
                    Service: 'es.amazonaws.com',
                  },
                  Action: 'sts:AssumeRole',
                },
              ],
            },
            ManagedPolicyArns: ['arn:aws:iam::aws:policy/AmazonESCognitoAccess'],
          },
        },
        RoleAttachment: {
          Type: 'AWS::Cognito::IdentityPoolRoleAttachment',
          Properties: {
            IdentityPoolId: { Ref: 'EsAuthIdentityPool' },
            Roles: {
              unauthenticated: {
                'Fn::GetAtt': ['EsAuthIdentityPoolUnAuthRole', 'Arn'],
              },
              authenticated: {
                'Fn::GetAtt': ['EsAuthIdentityPoolAuthRole', 'Arn'],
              },
            },
          },
        },
      },
      Outputs: {
        EsAuthUserPoolId: {
          Value: { Ref: 'EsAuthUserPool' },
        },
        EsAuthUserPoolClient: {
          Value: { Ref: 'EsAuthUserPoolClient' },
        },
        EsAuthUserPoolDomain: {
          Value: { Ref: 'EsAuthUserPoolDomain' },
        },
        EsAuthIdentityPoolId: {
          Value: { Ref: 'EsAuthIdentityPool' },
        },
        EsAuthIdentityPoolAuthRoleArn: {
          Value: { 'Fn::GetAtt': ['EsAuthIdentityPoolAuthRole', 'Arn'] },
        },
        EsAuthCognitoAccessForAmazonESArn: {
          Value: { 'Fn::GetAtt': ['EsAuthCognitoAccessForAmazonES', 'Arn'] },
        },
      },
    },
  };
  
  module.exports = serverlessConfiguration;