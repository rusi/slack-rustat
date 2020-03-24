import { APIGatewayProxyHandler } from 'aws-lambda';
import { makeRustat, makeRustatKeys } from '../helper';
import * as RustatService from '../services/rustat';
import { CreateRustatPayload } from '../types';
import { createSuccessResponse } from './response';
import 'source-map-support/register';

export const createRustat: APIGatewayProxyHandler = async event => {
  const data: CreateRustatPayload = JSON.parse(event.body);
  const { key, message, username } = data;

  await RustatService.createRustat(makeRustat(username, key, message));

  return createSuccessResponse(200, `Successfully created ${key} for ${username}`);
};

export const deleteRustat: APIGatewayProxyHandler = async event => {
  const { key, username } = event.pathParameters;

  await RustatService.deleteRustat(makeRustatKeys(username, key));

  return createSuccessResponse(200, `Successfully deleted ${key} for ${username}`);
};

export const listRustats: APIGatewayProxyHandler = async event => {
  const { username } = event.pathParameters;

  const response = await RustatService.listRustats(makeRustatKeys(username, ''));

  return createSuccessResponse(200, {
    message: 'Success',
    data: response,
  });
};
