import { CognitoIdentityServiceProvider } from 'aws-sdk';

const provider = new CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
  region: 'ap-northeast-1',
});

const signUp = async () => {
  const userName = 'keii2k84.dev@gmail.com';
  const customAttr01 = 'customAttr01';
  const nickname = 'nickname01';
  await provider
    .adminCreateUser({
      UserPoolId: 'us-east-1_k7qBHrysA',
      Username: userName,
      UserAttributes: [
        { Name: 'custom:customAttr', Value: customAttr01 },
        { Name: 'nickname', Value: nickname },
      ],
    })
    .promise()
    .then(() => console.log(
      `account created username: ${userName}, companyId: ${customAttr01}, nickname: ${nickname}`,
    ));
};
signUp();
