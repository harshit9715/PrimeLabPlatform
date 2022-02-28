import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../utils'
import dynamodbLib from "../../../utils/dynamodb-lib";
import { v4 as uuidv4 } from 'uuid';
const validate = require('./validation.js');
import { sendEmail, sendSMS } from "../../../utils/ses_sns";
const random = `${Math.floor(1000 + Math.random() * 9000)}`


export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {

  const body = JSON.parse(event.body!);
  const { firstName, lastName, email, phone, walletName, countryCode } = body;
  // EMAIL SIGNUP FLOW
  let existantError = true
  try {
    if (email) {
      await verifyUniqueUser(walletName, email)
      existantError = false
      await sendEmail(random, email);
    }
    else {
      await verifyUniqueUser(walletName, email, countryCode, phone)
      existantError = false
      await sendSMS(countryCode, phone, random)
    }
    const minutesToAdd=10;
    const otpExpiryTime = AddMinutesToDate(new Date(), minutesToAdd).toISOString()

    const user = {
      userId: uuidv4(),
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      status: 'PENDING',
      isPhoneVerified: false,
      isEmailVerified: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      wallets: [walletName],
      contacts: [],
      files: [],
      nftCollections: []
    }
    await dynamodbLib.put({
      TableName: process.env.USERS_TABLE_NAME!,
      Item: {...user, otp: random, otpExpiryTime}
    })
    return {
      statusCode: 200,
      body: {
        user,
        message: `A verification code has been sent to your ${email?'email: '+email: 'phone: '+countryCode+phone }.`
      }
    }
  } catch (err) {
    if (existantError) {
      return {
        statusCode: 400,
        body: {
          error: err.message
        }
      }
    }
    console.error(err)
    return {
      statusCode: err.statusCode || 500,
      body: {
        'message': 'Internal Server Error'
      }
    }
  }

}, validate)


async function verifyUniqueUser(walletName: string, email?:string, countryCode?:string, phone?:string) {
  const types = [
    {
      TableName: process.env.USERS_TABLE_NAME!,
      IndexName: 'ByWalletName',
      ProjectionExpression: 'userId',
      Limit: 1,
      KeyConditionExpression: 'walletName = :walletName',
      ExpressionAttributeValues: {
        ':walletName': walletName
      }
    }
  ]
  if (email) {
    types.push({
      TableName: process.env.USERS_TABLE_NAME!,
      IndexName: 'byEmail',
      ProjectionExpression: 'userId',
      Limit: 1,
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    })
  } else {
    types.push({
      TableName: process.env.USERS_TABLE_NAME!,
      IndexName: 'byPhone',
      ProjectionExpression: 'userId',
      Limit: 1,
      KeyConditionExpression: 'countryCode = :countryCode AND phone = :phone',
      ExpressionAttributeValues: {
        ':countryCode': countryCode,
        ':phone': phone
      }
    })
  }

  const responses = await Promise.all(types.map(param => dynamodbLib.query(param)))
  responses.forEach(resp => {
    if(resp.Count) {
      throw {
        statusCode: 400,
        message: 'Unique constraint failed!'
      }
    }
  })
}

function AddMinutesToDate(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}