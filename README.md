# SERVERLESS practice 

## aws elasticsearch with cognito 

### flow 

1. npm install 
2. npm run deploy:cognito (cognito domain must be unique [here](https://github.com/kimchunghwan/serverlesss-practice/blob/64923e5a4124e62f2cec4165efb1efec3e318217/elasticsearch-cognito/serverless-cognito.ts#L44) )
3. npm run deploy:elasticsearch
4. create user for test in cognito 
5. login kibana with created user 
