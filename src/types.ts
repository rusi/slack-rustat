import { RustatSubcommand } from './constants';

export interface OAuthResult {
  ok: boolean;
  app_id: string;
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  scope: string;
  token_type: string;
  access_token: string;
  bot_user_id: string;
  team: {
    id: string;
    name: string;
  };
  enterprise: {
    id: string;
    name: string;
  } | null;
  incoming_webhook: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
  response_metadata: object;
}

export interface AuthTokens {
  appId: string;
  botAccessToken: string;
  botId: string;
  botUserId: string;
  channelId: string;
  enterpriseId: string;
  teamId: string;
  userId: string;
  userAccessToken: string;
}

export interface Installation extends AuthTokens {
  PK: string;
  SK: string;
}

export interface CreateRustatPayload {
  key: string;
  message: string;
  username: string;
}

export interface SetActiveRustatPayload {
  expiryInSeconds?: number;
  expiryTimestamp?: number;
  key: string;
  username: string;
}

export interface RustatKeys {
  PK: string;
  SK: string;
}

export interface Rustat extends RustatKeys {
  key: string;
  message: string;
}

export type ActiveRustat = RustatKeys;

export interface BaseCommand {
  command: RustatSubcommand;
  payload: object;
}

export interface AddCommand extends BaseCommand {
  command: RustatSubcommand.Add;
  payload: {
    key: string;
    message: string;
  };
}

export interface ClearCommand extends BaseCommand {
  command: RustatSubcommand.Clear;
  payload: null;
}

export interface HelpCommand extends BaseCommand {
  command: RustatSubcommand.Help;
  payload: null;
}

export interface ListCommand extends BaseCommand {
  command: RustatSubcommand.List;
  payload: null;
}

export interface RemoveCommand extends BaseCommand {
  command: RustatSubcommand.Remove;
  payload: {
    key: string;
  };
}

export interface SetCommand extends BaseCommand {
  command: RustatSubcommand.Set;
  payload: {
    key: string;
    expiryTimestamp: number;
  };
}

export interface UnknownCommand extends BaseCommand {
  command: RustatSubcommand.Unknown;
  payload: {
    message: string;
  };
}

export type ParsedSubcommand =
  | AddCommand
  | ClearCommand
  | HelpCommand
  | ListCommand
  | RemoveCommand
  | SetCommand
  | UnknownCommand;
