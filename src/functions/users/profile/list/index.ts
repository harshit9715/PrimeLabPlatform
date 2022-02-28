import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../utils'
import dynamodbLib from "../../../utils/dynamodb-lib";
const validate = require('./validation.js');
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {
    const response = await dynamodbLib.scan({
      TableName: process.env.CONTACTS_TABLE_NAME!,
      ExclusiveStartKey: event.queryStringParameters?.pageToken as unknown as DocumentClient.Key
    })
  return {
    statusCode: 200,
    body: {
      items: response.Items,
      pageToken: response.LastEvaluatedKey
    },
  };
}, validate);
