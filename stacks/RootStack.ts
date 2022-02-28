import * as sst from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";

export default class RootStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);
    // Create a DynamoDB Table

    // const contactsTable = new sst.Table(this, 'ContactsTable', {
    //   primaryIndex: { partitionKey: 'id' },
    //   fields: { 'id': sst.TableFieldType.STRING }
    // })
    // contactsTable.dynamodbTable.applyRemovalPolicy(RemovalPolicy.DESTROY)
    // const lookUpTable = new sst.Table(this, 'userLookupTable', {
    //   primaryIndex: { partitionKey: 'walletId' },
    //   fields: {
    //     'walletId': sst.TableFieldType.STRING,
    //     'email': sst.TableFieldType.STRING,
    //     'phone': sst.TableFieldType.STRING,
    //     'countryCode': sst.TableFieldType.STRING
    //   },
    //   globalIndexes: {
    //     'byEmail': {
    //       partitionKey: 'email'
    //     },
    //     'byPhone': {
    //       partitionKey: 'countryCode',
    //       sortKey: 'phone'
    //     },
    //   }
    // })

    const usersTable = new sst.Table(this, 'UsersTable', {
      primaryIndex: { partitionKey: 'userId' },
      fields: {
        'id': sst.TableFieldType.STRING,
        'email': sst.TableFieldType.STRING,
        'phone': sst.TableFieldType.STRING,
        'walletName': sst.TableFieldType.STRING,
        'countryCode': sst.TableFieldType.STRING
      },
      globalIndexes: {
        'byEmail': {
          partitionKey: 'email'
        },
        'byPhone': {
          partitionKey: 'countryCode',
          sortKey: 'phone'
        },
        'ByWalletName': {
          partitionKey: 'walletName'
        }
      }
    })
    usersTable.dynamodbTable.applyRemovalPolicy(RemovalPolicy.DESTROY)
    // Create a HTTP API
    // const contactApi = new sst.Api(this, "ContactApi", {
    //   defaultFunctionProps: {
    //     environment: {
    //       CONTACTS_TABLE_NAME: contactsTable.dynamodbTable.tableName
    //     }
    //   },
    //   routes: {
    //     "POST /contacts": "src/functions/contacts/create/index.handler",
    //     "GET /contacts": "src/functions/contacts/list/index.handler",
    //     "GET /contacts/{id}": "src/functions/contacts/get/index.handler",
    //     "PATCH /contacts/{id}": "src/functions/contacts/update/index.handler",
    //     "PUT /contacts/{id}/import": "src/functions/contacts/import/index.handler",
    //     "PUT /contacts/{id}/block": "src/functions/contacts/block/index.handler",
    //     "DELETE /contacts/{id}": "src/functions/contacts/delete/index.handler",
    //     "GET /contacts/{id}/invite": "src/functions/contacts/invite/index.handler",
    //   },
    // });
    // contactApi.attachPermissions([contactsTable])


    // Create a HTTP API
    const usersApi = new sst.Api(this, "UsersApi", {
      defaultFunctionProps: {
        environment: {
          USERS_TABLE_NAME: usersTable.dynamodbTable.tableName,
          EMAIL_SENDER: 'no-reply@iharshit.site'
        }
      },
      routes: {
        "POST /users/signup": "src/functions/users/signup/index.handler",
        "POST /users/signup/confirm": "src/functions/users/otp_confirm/index.handler",
        "POST /users/signin": "src/functions/users/signin/index.handler",
        "POST /users/signin/confirm": "src/functions/users/otp_confirm/index.handler",
        "POST /token/refresh": "src/functions/users/refresh/index.handler",
        // "POST /logout": "src/functions/users/logout/index.handler",
        // "GET /users/id/{id}": "src/functions/users/get/index.handler",
        // "DELETE /users/id/{id}": "src/functions/users/delete/index.handler",


        // "PUT /users/id/{id}": "src/functions/users/update/index.handler",

        
        // "POST /users/{id}/verify": "src/functions/users/verify/index.handler",
        // "POST /users/{id}/verify/confirm": "src/users/confirm_verify/index.handler",
      },
    });
    usersApi.attachPermissions([usersTable])
    usersApi.attachPermissionsToRoute("POST /users/signup", ['ses', 'sns'])
    usersApi.attachPermissionsToRoute("POST /users/signin", ['ses', 'sns'])


    // Show the endpoint in the output
    // this.addOutputs({
    //   "contactApiEndpoint": contactApi.url,
    // });

    this.addOutputs({
      "usersApiEndpoint": usersApi.url,
    });
  }
}
