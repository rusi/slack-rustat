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
