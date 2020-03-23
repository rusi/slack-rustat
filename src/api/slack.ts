import { App, ExpressReceiver } from '@slack/bolt';
import serverless from 'serverless-http';
import { HELP_TEXT, RUSTAT_SUBCOMMANDS, RustatSubcommand } from '../constants';

// Set up custom receiver in order to hook up Express app to serverless-http
// Ref: https://github.com/slackapi/bolt/issues/191#issuecomment-493641934
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
const expressApp = receiver.app;

const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
});

interface BaseCommand {
  command: RustatSubcommand;
  payload: object;
}

interface AddCommand extends BaseCommand {
  command: RustatSubcommand.Add;
  payload: {
    key: string;
    message: string;
  };
}

interface ClearCommand extends BaseCommand {
  command: RustatSubcommand.Clear;
  payload: null;
}

interface HelpCommand extends BaseCommand {
  command: RustatSubcommand.Help;
  payload: null;
}

interface ListCommand extends BaseCommand {
  command: RustatSubcommand.List;
  payload: null;
}

interface RemoveCommand extends BaseCommand {
  command: RustatSubcommand.Remove;
  payload: {
    key: string;
  };
}

interface SetCommand extends BaseCommand {
  command: RustatSubcommand.Set;
  payload: {
    key: string;
    expiryInMinutes: number;
  };
}

interface UnknownCommand extends BaseCommand {
  command: RustatSubcommand.Unknown;
  payload: {
    message: string;
  };
}

type ParsedSubcommand =
  | AddCommand
  | ClearCommand
  | HelpCommand
  | ListCommand
  | RemoveCommand
  | SetCommand
  | UnknownCommand;

const parseSubcommand = (commandText = ''): ParsedSubcommand => {
  const tokens = commandText
    .trim()
    .replace(/[\s]/g, ' ')
    .split(' ');

  if (tokens[0] in RUSTAT_SUBCOMMANDS) {
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

  const message = tokens.join(' ');
  return {
    command: RustatSubcommand.Unknown,
    payload: {
      message,
    },
  };
};

app.command('/rustat', async ({ ack, command, respond }) => {
  ack();

  const subcommand = parseSubcommand(command.text);
  switch (subcommand.command) {
    case RustatSubcommand.Help: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: HELP_TEXT,
      });
    }
  }
});

app.command('/rusi', async ({ ack, command, respond }) => {
  ack();

  const subcommand = parseSubcommand(command.text);
  switch (subcommand.command) {
    case RustatSubcommand.Help: {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'ephemeral',
        text: HELP_TEXT,
      });
    }
  }
});

// (async (): Promise<void> => {
//   await app.start(process.env.PORT || 3000);

//   console.log('⚡️ Bolt app is running!');
// })();

export const handler = serverless(expressApp);
