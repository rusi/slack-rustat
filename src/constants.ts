export enum RustatSubcommand {
  Add = 'add',
  Clear = 'clear',
  Help = 'help',
  List = 'list',
  Remove = 'remove',
  Set = 'set',
  Unknown = 'unknown',
}

export const RUSTAT_SUBCOMMANDS = Object.values(RustatSubcommand);

export const HELP_TEXT = `Welcome to The Rustat Hristov Slack bot!

/rustat help
/rustat add <key> <message>
/rustat remove <key>
/rustat list
/rusi <key> [<expire in minutes>]
/rusi clear
`;
