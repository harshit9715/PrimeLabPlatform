import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../../utils'
import dynamodbLib from "../../../../utils/dynamodb-lib";
const validate = require('./validation.js');

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {

  const { id, email } = event.pathParameters!
  if (id) {
    const response = await dynamodbLib.get({
      TableName: process.env.USERS_TABLE_NAME!,
      Key: {
        userId: id
      }
    })
    return {
      statusCode: response.Item ? 200 : 404,
      body: response.Item || {
        message: 'User not found!'
      },
    };
  } else {
    const response = await dynamodbLib.query({
      TableName: process.env.USERS_TABLE_NAME!,
      IndexName:'byEmail',
      Limit: 1,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeValues: {
        ':pk': email ,
      },
      ExpressionAttributeNames: {
        '#pk': 'email'
      }
    })
    console.log(response)
    return {
      statusCode: response.Count ? 200 : 404,
      body: response.Items ? response.Items[0] : { 'message': 'User Not found' }
    }

  }

}, validate);
