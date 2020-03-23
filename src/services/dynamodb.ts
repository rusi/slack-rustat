// Ported https://github.com/99xt/serverless-dynamodb-client to TypeScript

import { DynamoDB } from 'aws-sdk';

const options: DynamoDB.ClientConfiguration = {
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'local',
  secretAccessKey: 'local',
};

const isOffline = (): boolean => !!process.env.IS_OFFLINE;

export type QueryOutput = DynamoDB.DocumentClient.QueryOutput;

export const DynamoDBDocumentClient = isOffline()
  ? new DynamoDB.DocumentClient(options)
  : new DynamoDB.DocumentClient();

export const DynamoDBService = isOffline() ? new DynamoDB(options) : new DynamoDB();

export const RUSTATS_TABLE_NAME = process.env.RUSTATS_TABLE_NAME || 'rustats';
