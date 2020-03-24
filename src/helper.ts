import { ActiveRustat, Rustat, RustatKeys } from './types';

export function makeInstallationPk(enterpriseId: string, teamId: string): string {
  return `PK#${enterpriseId}#${teamId}`;
}

export function makeInstallationSk(userId: string): string {
  return `#SK#${userId}`;
}

export function makeRustatPk(username: string): string {
  return `rustat#${username}`;
}

export function makeRustatSk(username: string, key: string): string {
  return `#key#${username}#${key}`;
}

export function makeActiveRustatPk(username: string): string {
  return `expiring#${username}`;
}

export function makeActiveRustatSk(timestamp: string): string {
  return `expires#${timestamp}`;
}

export function makeRustat(username: string, key: string, message: string): Rustat {
  return {
    PK: makeRustatPk(username),
    SK: makeRustatSk(username, key),
    key,
    message,
  };
}

export function makeRustatKeys(username: string, key: string): RustatKeys {
  return {
    PK: makeRustatPk(username),
    SK: makeRustatSk(username, key),
  };
}

export function makeActiveRustat(username: string, timestamp: string): ActiveRustat {
  return {
    PK: makeActiveRustatPk(username),
    SK: makeActiveRustatSk(timestamp),
  };
}
