import { APIGatewayProxyHandler } from 'aws-lambda';
import { makeRustatPk, makeRustatSk } from '../helper';
import * as RustatService from '../services/rustat';
import { CreateRustatPayload, Rustat, RustatKeys } from '../types';
import { createSuccessResponse } from './response';
import 'source-map-support/register';

export const createRustat: APIGatewayProxyHandler = async event => {
  const data: CreateRustatPayload = JSON.parse(event.body);
  const { key, message, username } = data;

  const rustat: Rustat = {
    PK: makeRustatPk(username),
    SK: makeRustatSk(username, key),
    key,
    message,
  };
  await RustatService.createRustat(rustat);

  return createSuccessResponse(200, `Successfully created ${key} for ${username}`);
};

export const deleteRustat: APIGatewayProxyHandler = async event => {
  const { key, username } = event.pathParameters;

  const rustatKeys: RustatKeys = {
    PK: makeRustatPk(username),
    SK: makeRustatSk(username, key),
  };
  await RustatService.deleteRustat(rustatKeys);

  return createSuccessResponse(200, `Successfully deleted ${key} for ${username}`);
};

export const listRustats: APIGatewayProxyHandler = async event => {
  const { username } = event.pathParameters;

  const rustatKeys: RustatKeys = {
    PK: makeRustatPk(username),
    SK: makeRustatSk(username, ''),
  };
  const response = await RustatService.listRustats(rustatKeys);

  return createSuccessResponse(200, {
    message: 'Success',
    data: response,
  });
};
