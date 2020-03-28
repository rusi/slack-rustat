import { RustatCommand, RustatSubcommand, RUSTAT_SUBCOMMANDS } from './constants';
import {
  AddCommand,
  AnnounceCommand,
  ClearCommand,
  HelpCommand,
  ListCommand,
  ParsedSubcommand,
  RemoveCommand,
  SetCommand,
} from './types';

export const parseSubcommand = (mainCommand: RustatCommand, commandText = ''): ParsedSubcommand => {
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
      case RustatSubcommand.Announce: {
        const subcommand: AnnounceCommand = {
          command,
          payload: null,
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
