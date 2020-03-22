import { makeActiveRustatPk, makeActiveRustatSk } from '../helper';
import { ActiveRustat, Rustat, RustatKeys } from '../types';
import { DynamoDBDocumentClient, QueryOutput } from './dynamodb';
import 'source-map-support/register';

export const createRustat = async (rustat: Rustat): Promise<void> => {
  await DynamoDBDocumentClient.put({
    TableName: 'rustats',
    Item: rustat,
  }).promise();
};

export const deleteRustat = async (rustatKeys: RustatKeys): Promise<void> => {
  await DynamoDBDocumentClient.delete({
    TableName: 'rustats',
    Key: rustatKeys,
  }).promise();
};

export const listRustats = async (rustatKeys: RustatKeys): Promise<QueryOutput> => {
  const { PK, SK } = rustatKeys;
  const response = await DynamoDBDocumentClient.query({
    TableName: 'rustats',
    KeyConditionExpression: 'PK = :pk AND SK >= :key',
    ExpressionAttributeValues: {
      ':pk': PK,
      ':key': SK,
    },
  }).promise();

  return response;
};

export const setActiveRustat = async (activeRustat: ActiveRustat): Promise<void> => {
  await DynamoDBDocumentClient.put({
    TableName: 'rustats',
    Item: activeRustat,
  }).promise();
};

export const getActiveRustat = async (username: string): Promise<QueryOutput> => {
  const response = await DynamoDBDocumentClient.query({
    TableName: 'rustats',
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
      TableName: 'rustats',
      Key: {
        PK,
        SK,
      },
    }).promise();
  }
};

export const listExpiredRustats = async (): Promise<QueryOutput> => {
  const response = await DynamoDBDocumentClient.query({
    TableName: 'rustats',
    KeyConditionExpression: 'SK <= :timestamp',
    ExpressionAttributeValues: {
      ':timestamp': makeActiveRustatSk(`${new Date().getTime()}`),
    },
  }).promise();

  return response;
};
