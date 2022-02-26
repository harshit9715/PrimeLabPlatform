/* eslint-disable @typescript-eslint/no-var-requires */
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {base_handler} from '../../../utils'

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyHandlerV2) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, World! Your request was received at. ${event}`,
  };
});
