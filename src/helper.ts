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
