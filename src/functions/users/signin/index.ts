import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { base_handler } from '../../../utils'
import dynamodbLib from "../../../utils/dynamodb-lib";
const validate = require('./validation.js');

import { sendEmail, sendSMS } from "../../../utils/ses_sns";

export const handler: APIGatewayProxyHandlerV2 = base_handler(async (event: APIGatewayProxyEventV2) => {
    
    const random = `${Math.floor(1000 + Math.random() * 9000)}`
    const body = JSON.parse(event.body!);
    const { email, phone, countryCode } = body;
    // EMAIL SIGNUP FLOW
    let existantError = true
    let userId;

    const minutesToAdd = 10;
    const otpExpiryTime = AddMinutesToDate(new Date(), minutesToAdd).toISOString()

    try {
        if (email) {
            userId = await verifyUserExists(email)
            existantError = false
            await sendEmail(random, email);
        }
        else {
            userId = await verifyUserExists(email, countryCode, phone)
            existantError = false
            await sendSMS(countryCode, phone, random)
        }

        const response = await dynamodbLib.update({
            TableName: process.env.USERS_TABLE_NAME!,
            ReturnValues: 'NONE',
            Key: {
                userId,
            },
            UpdateExpression: "SET otp = :otp, otpExpiryTime = :otpExp",
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': 'ACTIVE',
                ':otpExp': otpExpiryTime,
                ':otp': random,
            },
            ConditionExpression: '#status = :status'
        })
        console.log(response);
        
        return {
            statusCode: 200,
            body: {
                userId,
                message: `A login code has been sent to your ${email ? 'email: ' + email : 'phone: ' + countryCode + phone}.`
            }
        }
    } catch (err) {
        return {
            statusCode: err.statusCode || 400,
            body: {
                error: err.message || 'Internal Server Error'
            }
        }
    }
}, validate);


async function verifyUserExists(email?: string, countryCode?: string, phone?: string) {
    const types = []
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
            },
        })
    }

    const responses = await Promise.all(types.map(param => dynamodbLib.query(types[0])))
    let userId;
    responses.forEach(resp => {
        if (resp.Count) userId = resp.Items![0].userId;
    })
    if (!userId) {
        throw {
            statusCode: 400,
            message: 'Account not found/Not allowed!'
        }
    }
    return userId
}

function AddMinutesToDate(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}