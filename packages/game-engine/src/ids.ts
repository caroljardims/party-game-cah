const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCode(): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return s;
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}
