import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBDocumentClient } from '../services/dynamodb';
import { CreateRustatPayload } from './types';
import { createSuccessResponse, makeRustatPk, makeRustatSk } from './util';
import 'source-map-support/register';

export const createItem: APIGatewayProxyHandler = async event => {
  const data: CreateRustatPayload = JSON.parse(event.body);
  const { key, message, username } = data;

  await DynamoDBDocumentClient.put({
    TableName: 'rustats',
    Item: {
      PK: makeRustatPk(username),
      SK: makeRustatSk(username, key),
      key,
      message,
    },
  }).promise();

  return createSuccessResponse(200, `Successfully created ${key} for ${username}`);
};

export const deleteItem: APIGatewayProxyHandler = async event => {
  const { key, username } = event.pathParameters;

  await DynamoDBDocumentClient.delete({
    TableName: 'rustats',
    Key: {
      PK: makeRustatPk(username),
      SK: makeRustatSk(username, key),
    },
  }).promise();

  return createSuccessResponse(200, `Successfully deleted ${key} for ${username}`);
};

export const listItems: APIGatewayProxyHandler = async event => {
  const { username } = event.pathParameters;

  const response = await DynamoDBDocumentClient.query({
    TableName: 'rustats',
    KeyConditionExpression: 'PK = :pk AND SK >= :key',
    ExpressionAttributeValues: {
      ':pk': makeRustatPk(username),
      ':key': makeRustatSk(username, ''),
    },
  }).promise();

  return createSuccessResponse(200, {
    message: 'Success',
    data: response,
  });
};
