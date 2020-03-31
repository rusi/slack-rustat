import { APIGatewayProxyHandler } from 'aws-lambda';
import request from 'request-promise-native';
import * as InstallationService from '../services/installation';
import { Installation, OAuthResult } from '../types';
import { createSuccessResponse, createErrorResponse } from './response';

export const handler: APIGatewayProxyHandler = async event => {
  const { code } = event.queryStringParameters;

  const apiUrl = process.env.SLACK_API_URL;
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const redirectUrl = process.env.SLACK_REDIRECT_URL;

  try {
    const response = await request.post(`${apiUrl}/oauth.v2.access`, {
      form: {
        /* eslint-disable @typescript-eslint/camelcase */
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_url: redirectUrl,
        /* eslint-enable */
      },
    });

    const result: OAuthResult = (response ? JSON.parse(response) : {}) as OAuthResult;

    if (!result || !result.ok) {
      return createErrorResponse(401, {
        message: 'Failed oauthCallback',
        error: result,
      });
    }

    /* eslint-disable @typescript-eslint/camelcase */
    const {
      access_token: botAccessToken,
      app_id: appId,
      authed_user: { id: userId, access_token: userAccessToken },
      bot_user_id: botUserId,
      incoming_webhook: { channel_id: channelId },
      enterprise,
      team: { id: teamId },
    } = result;
    /* eslint-enable */

    const enterpriseId = enterprise ? enterprise.id : null;
    const installation: Installation = {
      PK: InstallationService.makeInstallationPk(teamId),
      SK: InstallationService.makeInstallationSk(enterpriseId),
      appId,
      botAccessToken,
      botId: botUserId,
      botUserId,
      channelId,
      enterpriseId,
      teamId,
      userAccessToken,
      userId,
    };
    await InstallationService.saveInstallation(installation);

    return createSuccessResponse(200, 'Success! You may close this page.');
  } catch (error) {
    return createErrorResponse(500, {
      message: 'Failed oauthCallback',
      error,
    });
  }
};
