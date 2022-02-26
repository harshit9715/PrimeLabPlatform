/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { deflateSync, gzipSync, brotliCompressSync } from 'zlib'

export function base_handler(lambda, validate={}) {
    return async function (event, context) {
event.queryStringParameters && Object.keys(event.queryStringParameters)
.filter(i => Array.isArray(event.queryStringParameters[i]))
.forEach(i => event.queryStringParameters[i]=event.queryStringParameters[i][0].split(','))
        const t1 = Date.now();
        let data;
try {
    // Ignore case for SQS Triggers
    if (event.Records && event.Records.length){
        event = JSON.parse(event.Records[0].body)
    }
    console.log("event", event);
    let valid;
    if (validate) {
        valid = await validate({
            body: JSON.parse(event.body || '{}'),
            path: event.pathParameters || {},
            query: event.queryStringParameters || {},
            headers: event.headers || {},
        });
} else {
    console.log('No request validation on the API.')
    valid = 'true'
}
if (valid) {
    // Run the Lambda
    data = await lambda(event, context);
}
else {
    // console.log(JSON.stringify(validate.errors));
    data = {
        "statusCode": 400,
        "body": validate.errors.map(item => `${item.message} ${item.params ? item.params.allowedValues ? '[' + item.params.allowedValues + ']' : '' : ''} at ${item.instancePath}`)
    };
            }
        } catch (e) {
            console.log(e);
            data = {
                body: { error: e.message },
                statusCode: 500
            };
        }
        console.log("event response", data.body);
        const response = {
            "statusCode": data.statusCode || 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            }
        }
        console.debug(`Lambda took ${(Date.now() - t1) / 1000} seconds before compression.`)
        if (event.headers && event.headers['accept-encoding']) {
            response["isBase64Encoded"] = true
            if (`${event.headers['accept-encoding']}`.includes("deflate")) {
                response["body"] = deflateSync(JSON.stringify(data.body)).toString('base64')
                response["headers"]["Content-Encoding"] = "deflate"
            } else if (`${event.headers['accept-encoding']}`.includes("gzip")) {
                response["body"] = gzipSync(JSON.stringify(data.body)).toString('base64')
                response["headers"]["Content-Encoding"] = "gzip"
            } else if (`${event.headers['accept-encoding']}`.includes("br")) {
                response["body"] = brotliCompressSync(JSON.stringify(data.body)).toString('base64')
                response["headers"]["Content-Encoding"] = "br"
            } else {
                response["isBase64Encoded"] = false
                response["body"] = JSON.stringify(data.body)
            }
        }
        else {
            response["isBase64Encoded"] = false
            response["body"] = JSON.stringify(data.body)
        }
        // Return HTTP response
        console.debug(`Lambda took ${(Date.now() - t1) / 1000} seconds after compression.`)
        return response;
    };
}
