const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 8;

function uniqueSortedStrings(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort();
}

function randomFromAlphabet(length: number, alphabet: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let result = "";

  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }

  return result;
}

export function generateInviteCode(length = INVITE_CODE_LENGTH): string {
  return randomFromAlphabet(length, INVITE_CODE_ALPHABET);
}

export function generateInviteCodeGrouped(): string {
  const raw = generateInviteCode(8);
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export function generateInviteLinkToken(length = 24): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return randomFromAlphabet(length, alphabet);
}
