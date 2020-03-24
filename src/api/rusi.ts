import { APIGatewayProxyHandler } from 'aws-lambda';
import { makeActiveRustat } from '../helper';
import * as RustatService from '../services/rustat';
import { SetActiveRustatPayload } from '../types';
import { createSuccessResponse, createErrorResponse } from './response';
import 'source-map-support/register';

const computeTimestampString = (setActiveRustatPayload: SetActiveRustatPayload): string => {
  const { expiryInSeconds, expiryTimestamp } = setActiveRustatPayload;

  if (expiryInSeconds) {
    const nowInSeconds = Math.floor(new Date().getTime() / 1000);
    return `${nowInSeconds + expiryInSeconds}`;
  } else if (expiryTimestamp) {
    return `${expiryTimestamp}`;
  }

  return '';
};

export const getActiveRustat: APIGatewayProxyHandler = async event => {
  const { username } = event.pathParameters;

  const response = await RustatService.getActiveRustat(username);
  const emptyResponse = !Object.keys(response).length || response.Count == 0;

  if (emptyResponse) {
    return createErrorResponse(404, `No active rustat for ${username}`);
  }

  return createSuccessResponse(200, {
    message: 'Success',
    data: response,
  });
};

export const clearActiveRustat: APIGatewayProxyHandler = async event => {
  const { username } = event.pathParameters;

  await RustatService.clearActiveRustat(username);

  return createSuccessResponse(200, `Successfully cleared active rustat for ${username}`);
};

export const setActiveRustat: APIGatewayProxyHandler = async event => {
  const data: SetActiveRustatPayload = JSON.parse(event.body);
  const { key, username } = data;

  await RustatService.clearActiveRustat(username);

  const timestampString = computeTimestampString(data);

  await RustatService.setActiveRustat(makeActiveRustat(username, timestampString));

  return createSuccessResponse(200, `Successfully set active rustat ${key} for ${username}`);
};
