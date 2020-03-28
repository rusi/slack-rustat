export enum RustatCommand {
  Rustat = '/rustat',
  Rusi = '/rusi',
}

export enum RustatSubcommand {
  Add = 'add',
  Announce = 'announce',
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
\`/rusi <key> [<expiry>]\` -- Activate the rustat with the shortcut keyword \`<key>\` that will (optionally) automatically be cleared by \`<expiry\` (_<https://github.com/wanasit/chrono|in human language!>_); e.g. \`/rusi lunch\`, \`/rusi sleep until 10pm\`, \`/rusi meeting for 30 minutes\` or \`/rusi call until 2am EST\`
\`/rusi clear\` -- Clear your current status message (whether it's a rustat or not)
`;

export const HISTORY_TEXT = `_One day..._

*Rusi:*
> btw, I am thinking about adding a bot to help me set my slack status easier... something to help with the whole WFH situation :confused:

> I want to have pre-defined statuses, like ":hamburger: ...lunch" and ":afk: away from the keyboard", and others

> and that would be easy to trigger with \`/status lunch\` or \`/status afk\` or \`/status clear\` ...

> actually that exists :smile:

> it is not as nice as a one word status msg... but it's usable :slightly_smiling_face:

*Me:*
> So what you want is actually pre-defined status messages that may be activated with a shortcut/keyword?

*Rusi:*
> yes, and maybe some other functions similar to slack's workflows - say I set my status with \`/status lunch\` - maybe after an hour, a message will popup with a button - "are you back" or something like that

> or I can have \`/status meeting 30\` to set a 30 minute meeting status message

> the idea is that you should be able to see my slack status, and know what's going on - similar to when we are in the office together - you can just look at my desk and see me working, or having a meeting, or eating, or not being there :smile:

_A few days later..._

${HELP_TEXT}
`;
