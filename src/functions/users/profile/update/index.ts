import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../../utils'
import dynamodbLib from "../../../../utils/dynamodb-lib";
const validate = require('./validation.js');

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {

  // const { id } = JSON.parse(event.body!)
  //   const response = await dynamodbLib.put({
  //     TableName: process.env.USERS_TABLE_NAME!,
  //     Key: {
  //       userId: id
  //     }
  //   })
    // return {
    //   statusCode: response.Item ? 200 : 404,
    //   body: response.Item || {
    //     message: 'User not found!'
    //   },
    // };

}, validate);
