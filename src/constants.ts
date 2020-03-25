export enum RustatCommand {
  Rustat = '/rustat',
  Rusi = '/rusi',
}

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

export const HELP_TEXT = `Welcome to :sparkles:*The Rustat Hristov Slack bot*:sparkles:!

A "rustat" is a predefined :sparkles:fancy status message:sparkles:. ~It can also mean "R. U. status", that is, "Are you <status>?", like "Are you \`lunch\`?"~ NOPE.

\`/rustat help\` -- Print this help text

*Manage your rustats*
\`/rustat add <key> <message>\` -- Save a rustat with the shortcut keyword \`<key>\`; if \`<message>\` starts with an emoji, that emoji will be used as status emoji
\`/rustat remove <key>\` -- Deletes a rustat with the shortcut keyword \`<key>\`
\`/rustat list\` -- List all saved rustats

*Set your status message*
\`/rusi <key> [<expiry>]\` -- Activate the rustat with the shortcut keyword \`<key>\` that will automatically be cleared by \`<expiry\` (_<https://github.com/wanasit/chrono|in human language!>_)
\`/rusi clear\` -- Clear your current status message (whether it's a rustat or not)
`;
