import aws from './aws-sdk'

const YOUR_MESSAGE = (otp: string) => `Your account verification code is ${otp}`

const ses = new aws.SES();
const sns = new aws.SNS();

export async function sendSMS(countryCode: string, phone: string, otp: string) {
    await sns.publish({
        Message: YOUR_MESSAGE(otp),
        PhoneNumber: `${countryCode}${phone}`,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': 'PrimeLabs'
            },
            'AWS.SNS.SMS.SMSType': {
                'DataType': 'String',
                'StringValue': "Transactional"
            }
        }
    }).promise()
}

export async function sendEmail(otp: string, toAddress: string) {
    const htmlBody =
        `<!DOCTYPE html>
        <html>
          <body>
            <p>Use the code below to verify your account at PrimeLabs</p>
            <p><h1>` + otp + `</h1></p>
          </body>
        </html>`;

    const params = {
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: htmlBody,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Welcome to PrimeLabs! Account Verification Mail",
            },
        },
        Source: process.env.EMAIL_SENDER!
    };

    await ses.sendEmail(params).promise();
}