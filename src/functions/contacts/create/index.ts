import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../utils'
import dynamodbLib from "../../../utils/dynamodb-lib";
import { v4 as uuidv4 } from 'uuid';
const validate = require('./validation.js');

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {

  const body = JSON.parse(event.body!);

  for (let i = 0; i < body.length; i++) {
    body[i].id = uuidv4()
    await dynamodbLib.put({
      TableName: process.env.CONTACTS_TABLE_NAME!,
      Item: body[i]
    });
  }
  return {
    statusCode: 201,
    body,
  };
}, validate);
