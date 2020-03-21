import { APIGatewayProxyResult } from 'aws-lambda';

const headers = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const makeResponseMessage = (message: string | object, fallback: string | object): string =>
  JSON.stringify(typeof message === 'string' ? { message } : message || fallback);

export const createSuccessResponse = (statusCode = 200, message?: string | object): APIGatewayProxyResult => ({
  statusCode,
  headers,
  body: makeResponseMessage(message, { message: 'OK' }),
});

export const createErrorResponse = (statusCode = 500, message?: string | object): APIGatewayProxyResult => ({
  statusCode,
  headers,
  body: makeResponseMessage(message, { message: 'Unhandled error' }),
});

export const OkResponse = createSuccessResponse();

export function makeRustatPk(username: string): string {
  return `rustat#${username}`;
}

export function makeRustatSk(username: string, key: string): string {
  return `#key#${username}#${key}`;
}

export function makeActiveRustatPk(username: string): string {
  return `expiring#${username}`;
}

export function makeActiveRustatSk(timestamp: string): string {
  return `expires#${timestamp}`;
}
