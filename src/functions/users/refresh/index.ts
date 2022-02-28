import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../utils'
import dynamodbLib from "../../../utils/dynamodb-lib";
import jwt from "jsonwebtoken";
import { configs } from '../../../../config/auth.config'


const validate = require('./validation.js');

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {

    const {refreshtoken} = event.headers
    try {
        const data = await jwt.verify(refreshtoken!, configs.secret)
        console.log(data);

        const token = jwt.sign(data, configs.secret, { expiresIn: configs.jwtExpiration})
    } catch (error) {
        console.error(error);
        
        return {
            statusCode: 401,
            body: {
                message: refreshtoken? 'logged out.' : 'Refresh token is required.'
            }
        }
    }
    
  return {
    statusCode: 404,
    body: {
      message: 'Item not found!'
    },
  };
}, validate);
