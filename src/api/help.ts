import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const get: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: '/rustat help',
    }),
  };
};
