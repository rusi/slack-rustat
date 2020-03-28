import { App, AuthorizeResult, AuthorizeSourceData, ExpressReceiver } from '@slack/bolt';
import chrono from 'chrono-node';
import { format } from 'date-fns';
import serverless from 'serverless-http';
import { HELP_TEXT, RustatCommand, RUSTAT_SUBCOMMANDS, RustatSubcommand } from '../constants';
import * as RustatService from '../services/rustat';
import * as InstallationService from '../services/installation';
import {
  AddCommand,
  AuthTokens,
  ClearCommand,
  HelpCommand,
  ListCommand,
  ParsedSubcommand,
  RemoveCommand,
  Rustat,
  SetCommand,
} from '../types';

// const authorizeFn = ({ teamId, enterpriseId, userId, conversationId }) => {
const authorizeFn = async ({ enterpriseId, teamId, userId }: AuthorizeSourceData): Promise<AuthorizeResult> => {
  // check wherever you've stored the tokens and get the values based on teamId and/or userId
  const result = await InstallationService.listInstallations(enterpriseId, teamId, userId);
  if (result && result.Count > 0) {
    const { botId, userAccessToken: userToken } = result.Items[0] as AuthTokens;
    return {
      botId,
      userToken,
    };
  }
  throw new Error('No matching authorizations');
};

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const expressApp = receiver.app;

const app = new App({
  authorize: authorizeFn,
  convoStore: false,
  receiver,
});

const parseSubcommand = (mainCommand: RustatCommand, commandText = ''): ParsedSubcommand => {
  console.log(`Raw command: "${commandText}"`);

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

    const command = tokens.shift();
    switch (command) {
      case RustatSubcommand.Add: {
        const key = tokens.shift();
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
        const key = tokens.shift();
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

    const key = tokens.shift();
    const expiryString = tokens.join(' ');
    const subcommand: SetCommand = {
      command: RustatSubcommand.Set,
      payload: {
        key,
        expiryString,
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

app.command('/rustat', async ({ ack: respond, command }) => {
  console.log(`Received "/rustat ${command.text}" from ${command.user_name}`);

  const subcommand = parseSubcommand(RustatCommand.Rustat, command.text);

  const user = command.user_id;

  switch (subcommand.command) {
    case RustatSubcommand.Add: {
      try {
        const { key, message } = subcommand.payload;
        if (!key) {
          throw new Error('Missing `key`');
        }
        if (key === RustatSubcommand.Clear) {
          throw new Error('`clear` is a reserved keyword');
        }
        if (!message) {
          throw new Error('Missing `message`');
        }

        await RustatService.createRustat(RustatService.makeRustat(user, key, message));

        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          text: `Successfully saved rustat with key "${key}"`,
        });
      } catch (e) {
        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          attachments: [
            {
              color: '#ff0000',
              text: e.message,
            },
          ],
          text: 'Error saving rustat',
        });
      }
      break;
    }
    case RustatSubcommand.Help: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: HELP_TEXT,
      });
      break;
    }
    case RustatSubcommand.List: {
      try {
        const result = await RustatService.listRustats(user);
        const rustats: Rustat[] = result.Items as Rustat[];

        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          attachments: [
            {
              text: rustats.map(({ key, message }) => `\`${key}\` → ${message}`).join('\n'),
            },
          ],
          text: rustats.length ? 'Your saved rustats:' : 'You have no saved rustats.',
        });
      } catch (e) {
        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          attachments: [
            {
              color: '#ff0000',
              text: e.message,
            },
          ],
          text: 'Error listing rustats',
        });
      }
      break;
    }
    case RustatSubcommand.Remove: {
      try {
        const { key } = subcommand.payload;
        if (!key) {
          throw new Error('Missing `key`');
        }

        await RustatService.deleteRustat(RustatService.makeRustatKeys(user, key));

        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          text: `Successfully deleted rustat with key "${key}"`,
        });
      } catch (e) {
        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          attachments: [
            {
              color: '#ff0000',
              text: e.message,
            },
          ],
          text: 'Error deleting rustat',
        });
      }
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
  console.log(`End processing "/rustat ${command.text}" from ${command.user_name}`);
});

app.command('/rusi', async ({ ack: respond, client, command, payload }) => {
  console.log(`Received "/rusi ${command.text}" from ${command.user_name}`);

  const subcommand = parseSubcommand(RustatCommand.Rusi, command.text);
  const user = command.user_id;

  switch (subcommand.command) {
    case RustatSubcommand.Clear: {
      try {
        await RustatService.clearActiveRustat(user);

        await client.users.profile.set({
          profile: JSON.stringify({
            /* eslint-disable @typescript-eslint/camelcase */
            status_text: '',
            status_emoji: '',
            /* eslint-enable */
          }),
          user,
        });

        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          text: 'Successfully cleared active rustat',
        });
      } catch (e) {
        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          attachments: [
            {
              color: '#ff0000',
              text: e.message,
            },
          ],
          text: 'Error clearing active rustat',
        });
      }
      break;
    }
    case RustatSubcommand.Help: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: HELP_TEXT,
      });
      break;
    }
    case RustatSubcommand.Set: {
      try {
        const { key, expiryString } = subcommand.payload;
        if (!key) {
          throw new Error('Missing `key`');
        }

        const result = await RustatService.listRustats(user);
        const rustats: Rustat[] = result.Items as Rustat[];
        const rustat = rustats.find(r => r.key === key);

        if (!rustat) {
          throw new Error(`Rustat with key "${key}" not found!`);
        }

        const { user: userInfo } = await client.users.info({ user });
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const tzLabel: string = userInfo && (userInfo as any).tz_label ? (userInfo as any).tz_label : '';
        const tzOffsetSeconds: number = userInfo && (userInfo as any).tz_offset ? (userInfo as any).tz_offset : 0;
        console.log(tzLabel, tzOffsetSeconds);
        /* eslint-enable */

        const { message } = rustat;
        const tokens = message.split(' ');
        const emoji = /\:\w+\:/.test(tokens[0]) ? tokens.shift() : ':spock-hand:';
        const text = emoji ? tokens.join(' ') : message;

        const msToSec = (ms: number): number => Math.floor(ms / 1000);
        const dateToSec = (d: Date): number => msToSec(d.getTime());
        const zToTz = (d: Date, tzOffsetSeconds = 0): Date => {
          const offsetDate = new Date((dateToSec(d) + tzOffsetSeconds) * 1000);
          const tzString = String((tzOffsetSeconds * 100) / 3600).padStart(4, '0');
          const dateWithTzString = offsetDate.toISOString().replace('Z', `+${tzString}`);
          const result = new Date(dateWithTzString);
          console.log(
            `Converting ${d.toISOString()} to TZ ${tzString} => ${result.toISOString()} == ${dateWithTzString} // TZ offset sec ${tzOffsetSeconds}`
          );
          return result;
        };

        const nowWithUserTzOffset = zToTz(new Date(), tzOffsetSeconds);
        console.log(
          `Parsing expiry from "${expiryString}"... Reference time: ${nowWithUserTzOffset.toISOString()} => ${dateToSec(
            nowWithUserTzOffset
          )}`
        );
        const expiryDate: Date | null = chrono.parseDate(expiryString, nowWithUserTzOffset, { forwardDate: true });
        if (expiryDate) {
          console.log(
            `Parsed expiry from "${expiryString}": ${expiryDate.toISOString()} => ${dateToSec(
              expiryDate
            )}; Reference time: ${nowWithUserTzOffset.toISOString()} => ${dateToSec(nowWithUserTzOffset)}`
          );
        } else {
          console.log(`Failed parsing "${expiryString}"!`);
        }
        const expiryTimestamp = expiryDate ? dateToSec(expiryDate) : undefined;

        const profile = JSON.stringify({
          /* eslint-disable @typescript-eslint/camelcase */
          status_text: text,
          status_emoji: emoji,
          status_expiration: expiryTimestamp,
          /* eslint-enable */
        });
        console.log(profile, dateToSec(new Date()));
        await client.users.profile.set({
          profile,
          user,
        });

        const rawDateWithoutTz = new Date((dateToSec(expiryDate) + tzOffsetSeconds) * 1000);
        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          text: `Successfully set active rustat to "${key}"${
            expiryDate ? ` which expires on ${format(rawDateWithoutTz, 'PPpp')} ${tzLabel}` : ''
          }`,
        });
      } catch (e) {
        respond({
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'ephemeral',
          attachments: [
            {
              color: '#ff0000',
              text: e.message,
            },
          ],
          text: 'Error setting active rustat',
        });
      }
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
  console.log(`End processing "/rusi ${command.text}" from ${command.user_name}`);
});

export const start = async (): Promise<void> => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
};

export const handler = serverless(expressApp);
