import { Rustat, RustatKeys } from '../types';
import { DynamoDBDocumentClient, QueryOutput } from './dynamodb';
import 'source-map-support/register';

const RUSTATS_TABLE_NAME = process.env.RUSTATS_TABLE_NAME || 'rustats';

const makeRustatPk = (username: string): string => `rustat#${username}`;
const makeRustatSk = (username: string, key: string): string => `#key#${username}#${key}`;

export const makeRustat = (username: string, key: string, message: string): Rustat => ({
  PK: makeRustatPk(username),
  SK: makeRustatSk(username, key),
  key,
  message,
});

export const makeRustatKeys = (username: string, key: string): RustatKeys => ({
  PK: makeRustatPk(username),
  SK: makeRustatSk(username, key),
});

export const createRustat = async (rustat: Rustat): Promise<void> => {
  await DynamoDBDocumentClient.put({
    TableName: RUSTATS_TABLE_NAME,
    Item: rustat,
  }).promise();
};

export const deleteRustat = async (rustatKeys: RustatKeys): Promise<void> => {
  await DynamoDBDocumentClient.delete({
    TableName: RUSTATS_TABLE_NAME,
    Key: rustatKeys,
  }).promise();
};

export const listRustats = async (username: string): Promise<QueryOutput> => {
  const response = await DynamoDBDocumentClient.query({
    TableName: RUSTATS_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK >= :key',
    ExpressionAttributeValues: {
      ':pk': makeRustatPk(username),
      ':key': makeRustatSk(username, ''),
    },
  }).promise();

  return response;
};
