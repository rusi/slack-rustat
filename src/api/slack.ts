import { App, LogLevel } from '@slack/bolt';
import Auth from '../services/bolt-oauth';
import chrono from 'chrono-node';
import serverless from 'serverless-http';
import { HELP_TEXT, RustatCommand, RUSTAT_SUBCOMMANDS, RustatSubcommand } from '../constants';
import { makeInstallationPk, makeInstallationSk } from '../helper';
// import * as RustatService from '../services/rustat';
// import { ActiveRustat, Rustat, RustatKeys } from '../types';
import * as InstallationService from '../services/installation';
import {
  AddCommand,
  AuthTokens,
  ClearCommand,
  HelpCommand,
  Installation,
  ListCommand,
  OAuthResult,
  ParsedSubcommand,
  RemoveCommand,
  SetCommand,
} from '../types';

const oauthSuccess = async ({ res, oAuthResult }: { res: object; oAuthResult: OAuthResult }): Promise<void> => {
  // save oAuthResult somewhere permanent since it has all the tokens
  /* eslint-disable @typescript-eslint/camelcase */
  const {
    access_token: botAccessToken,
    app_id: appId,
    authed_user: { id: userId, access_token: userAccessToken },
    bot_user_id: botUserId,
    incoming_webhook: { channel_id: channelId },
    enterprise,
    team: { id: teamId },
  } = oAuthResult;
  const enterpriseId = enterprise ? enterprise.id : null;
  const installation: Installation = {
    PK: makeInstallationPk(enterpriseId, teamId),
    SK: makeInstallationSk(userId),
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
  /* eslint-enable */
  await InstallationService.saveInstallation(installation);
  res.send('Success! You may close this page.');
};

const oauthError = (error): void => {
  console.log('oauthError', error);
  // do something about that error to let the user know
};

const oauthStateCheck = (/* oAuthState */): boolean => {
  // check the parameter state against your saved state to ensure everything is ok
  // BUT SOMEHOW this state is always empty...
  return true;
};

// const authorizeFn = ({ teamId, enterpriseId, userId, conversationId }) => {
const authorizeFn = async ({ enterpriseId, teamId, userId }): Promise<AuthTokens> => {
  console.log('authorize', enterpriseId, teamId, userId);

  // check wherever you've stored the tokens and get the values based on teamId and/or userId
  const result = await InstallationService.listInstallations(enterpriseId, teamId, userId);
  console.log(result);
  if (result && result.Count > 0) {
    const { PK, SK, ...authTokens } = result.Items[0];
    return authTokens as AuthTokens;
  }
  throw new Error('No matching authorizations');
};

const receiver = Auth({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  redirectUrl: process.env.SLACK_REDIRECT_URL,
  stateCheck: oauthStateCheck,
  onSuccess: oauthSuccess,
  onError: oauthError,
});
const expressApp = receiver.app;
const token = process.env.SLACK_BOT_TOKEN;

const app = new App({
  authorize: authorizeFn,
  logLevel: LogLevel.DEBUG,
  receiver,
  token,
});

const parseSubcommand = (mainCommand: RustatCommand, commandText = ''): ParsedSubcommand => {
  console.log(`Processing "${commandText}"...`);

  const tokens = commandText
    .trim()
    .replace(/[\s]/g, ' ')
    .split(' ');

  if (!tokens.length || !tokens[0]) {
    console.log('Command text is empty; default to "help"');
    tokens[0] = RustatSubcommand.Help;
  }

  if (RUSTAT_SUBCOMMANDS.includes(tokens[0] as RustatSubcommand)) {
    console.log(`Processing "${tokens[0]}"...`);

    const command = tokens.pop();
    switch (command) {
      case RustatSubcommand.Add: {
        const key = tokens.pop();
        const message = tokens.join(' ');
        const subcommand: AddCommand = {
          command,
          payload: {
            key,
            message,
          },
        };
        return subcommand;
      }
      case RustatSubcommand.Clear: {
        const subcommand: ClearCommand = {
          command,
          payload: null,
        };
        return subcommand;
      }
      case RustatSubcommand.Help: {
        const subcommand: HelpCommand = {
          command,
          payload: null,
        };
        return subcommand;
      }
      case RustatSubcommand.List: {
        const subcommand: ListCommand = {
          command,
          payload: null,
        };
        return subcommand;
      }
      case RustatSubcommand.Remove: {
        const key = tokens.pop();
        const subcommand: RemoveCommand = {
          command,
          payload: {
            key,
          },
        };
        return subcommand;
      }
    }
  }

  // if /rusi and there is no known keyword, assume Set command
  if (mainCommand === RustatCommand.Rusi) {
    console.log(`Processing "${commandText}" as setting active rustat...`);

    const key = tokens.pop();
    const expiryDate: Date = chrono.parse(tokens.join(' '));
    const subcommand: SetCommand = {
      command: RustatSubcommand.Set,
      payload: {
        key,
        expiryTimestamp: expiryDate.getTime(),
      },
    };
    return subcommand;
  } else {
    console.log(`Unable to parse "${commandText}!"`);

    const message = tokens.join(' ');
    return {
      command: RustatSubcommand.Unknown,
      payload: {
        message,
      },
    };
  }
};

app.command('/rustat', async ({ ack, command, respond }) => {
  ack();

  console.log(`Received "/rustat ${command.text}" from ${command.user_name}`);

  const subcommand = parseSubcommand(RustatCommand.Rustat, command.text);

  switch (subcommand.command) {
    case RustatSubcommand.Help: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: HELP_TEXT,
      });
      break;
    }
    case RustatSubcommand.Unknown: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: `Unable to parse \`/rustat ${command.text}\`!`,
      });
      break;
    }
  }
});

app.command('/rusi', async ({ ack, command, respond }) => {
  ack();

  console.log(`Received "/rusi ${command.text}"`);

  const subcommand = parseSubcommand(RustatCommand.Rusi, command.text);
  switch (subcommand.command) {
    case RustatSubcommand.Help: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: HELP_TEXT,
      });
      break;
    }
    case RustatSubcommand.Unknown: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: `Unable to parse \`/rusi ${command.text}\`!`,
      });
      break;
    }
  }
});

export const start = async (): Promise<void> => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
};

export const handler = serverless(expressApp);
