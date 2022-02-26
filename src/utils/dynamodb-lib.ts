import { DocumentClient } from "aws-sdk/clients/dynamodb";

import aws from "./aws-sdk";

const client = new aws.DynamoDB.DocumentClient();

export default {
  get: (params: DocumentClient.GetItemInput) => client.get(params).promise(),
  put: (params: DocumentClient.PutItemInput) => client.put(params).promise(),
  query: (params: DocumentClient.QueryInput) => client.query(params).promise(),
  update: (params: DocumentClient.UpdateItemInput) => client.update(params).promise(),
  delete: (params: DocumentClient.DeleteItemInput) => client.delete(params).promise(),
  batchGet: (params: DocumentClient.BatchGetItemInput) => client.batchGet(params).promise(),
  batchWrite: (params: DocumentClient.BatchWriteItemInput) => client.batchWrite(params).promise(),
  scan: (params: DocumentClient.ScanInput) => client.scan(params).promise(),
};