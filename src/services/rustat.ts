import { ActiveRustat, Rustat, RustatKeys } from '../types';
import { DynamoDBDocumentClient, QueryOutput } from './dynamodb';
import 'source-map-support/register';

const RUSTATS_TABLE_NAME = process.env.RUSTATS_TABLE_NAME || 'rustats';

const makeRustatPk = (username: string): string => `rustat#${username}`;
const makeRustatSk = (username: string, key: string): string => `#key#${username}#${key}`;

const makeActiveRustatPk = (username: string): string => `expiring#${username}`;
const makeActiveRustatSk = (timestamp: string): string => `expires#${timestamp}`;

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

export const makeActiveRustat = (username: string, timestamp: string): ActiveRustat => ({
  PK: makeActiveRustatPk(username),
  SK: makeActiveRustatSk(timestamp),
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

export const setActiveRustat = async (activeRustat: ActiveRustat): Promise<void> => {
  await DynamoDBDocumentClient.put({
    TableName: RUSTATS_TABLE_NAME,
    Item: activeRustat,
  }).promise();
};

export const getActiveRustat = async (username: string): Promise<QueryOutput> => {
  const response = await DynamoDBDocumentClient.query({
    TableName: RUSTATS_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK >= :timestamp',
    ExpressionAttributeValues: {
      ':pk': makeActiveRustatPk(username),
      ':timestamp': makeActiveRustatSk(''),
    },
  }).promise();

  return response;
};

export const clearActiveRustat = async (username: string): Promise<void> => {
  const response = await getActiveRustat(username);
  if (response.Count > 0) {
    const { PK, SK } = response.Items[0];
    await DynamoDBDocumentClient.delete({
      TableName: RUSTATS_TABLE_NAME,
      Key: {
        PK,
        SK,
      },
    }).promise();
  }
};

export const listExpiredRustats = async (): Promise<QueryOutput> => {
  const response = await DynamoDBDocumentClient.query({
    TableName: RUSTATS_TABLE_NAME,
    KeyConditionExpression: 'SK <= :timestamp',
    ExpressionAttributeValues: {
      ':timestamp': makeActiveRustatSk(`${new Date().getTime()}`),
    },
  }).promise();

  return response;
};
