import * as sst from "@serverless-stack/resources";

export default class RootStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);
    // Create a DynamoDB Table

    const contactsTable = new sst.Table(this, 'ContactsTable', {
      primaryIndex: {partitionKey: 'id'},
      fields: {'id': sst.TableFieldType.STRING}
    })
    // Create a HTTP API
    const api = new sst.Api(this, "ContactApi", {
      defaultFunctionProps: {
        environment: {
          CONTACTS_TABLE_NAME: contactsTable.dynamodbTable.tableName
        }
      },
      routes: {
        "POST /contacts": "src/functions/contacts/create/index.handler",
        "GET /contacts": "src/functions/contacts/list/index.handler",
        "GET /contacts/{id}": "src/functions/contacts/get/index.handler",
        "PATCH /contacts/{id}": "src/functions/contacts/update/index.handler",
        "PUT /contacts/{id}/import": "src/functions/contacts/import/index.handler",
        "PUT /contacts/{id}/block": "src/functions/contacts/block/index.handler",
        "DELETE /contacts/{id}": "src/functions/contacts/delete/index.handler",
        "GET /contacts/{id}/invite": "src/functions/contacts/invite/index.handler",
      },
    });

    api.attachPermissions([contactsTable])

    // Show the endpoint in the output
    this.addOutputs({
      "ApiEndpoint": api.url,
    });
  }
}
