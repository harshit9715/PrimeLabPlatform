import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../../utils'
import dynamodbLib from "../../../../utils/dynamodb-lib";
const validate = require('./validation.js');

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {
    const response = await dynamodbLib.delete({
      TableName: process.env.CONTACTS_TABLE_NAME!,
      Key: {
        id: event.pathParameters!.id,
      },
      ReturnValues: 'ALL_OLD',
    })
  return {
    statusCode: response.Attributes? 200 : 404,
    body: response.Attributes || {
      message: 'User not found!'
    },
  };
}, validate);
