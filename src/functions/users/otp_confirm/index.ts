import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../utils'
import dynamodbLib from "../../../utils/dynamodb-lib";
const validate = require('./validation.js');
import jwt from "jsonwebtoken";
import { configs } from '../../../../config/auth.config'

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {

  const body = JSON.parse(event.body!);
  const { userId, email, phone, otp } = body;
  try {
    const db_data ={
      TableName: process.env.USERS_TABLE_NAME!,
      ReturnValues: 'ALL_NEW',
      Key: {
        "userId": userId
      },
      UpdateExpression: "SET #status = :status, #updated = :updated, #verifyAtr = :verifyAtr REMOVE otp, otpExpiryTime",
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updated': 'updated',
        '#verifyAtr': email ? 'isEmailVerified' : 'isPhoneVerified',
        '#attr': email ? 'email' : 'phone',
      },
      ExpressionAttributeValues: {
        ':status': 'ACTIVE',
        ':updated': new Date().toISOString(),
        ':verifyAtr': true,
        ':otp': `${otp}`,
        ':attr': email ? email : phone,
      },
      ConditionExpression: 'otp = :otp AND #attr = :attr AND otpExpiryTime > :updated'
    }
    console.log(db_data)
    const response = await dynamodbLib.update(db_data)
    console.log('attribs', response.Attributes)
    const accessToken = jwt.sign(response.Attributes!, configs.secret, {
      expiresIn: configs.jwtExpiration,
    });

    const refreshToken = jwt.sign(response.Attributes!, configs.secret, {
      expiresIn: configs.jwtRefreshExpiration,
    })

    return {
      statusCode: 200,
      body: {
        message: 'success',
        user: response.Attributes,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: {
        error: 'OTP Verification failed.'
      }
    }
  }

}, validate);


