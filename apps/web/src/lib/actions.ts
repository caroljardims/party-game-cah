import { call } from "../firebase.js";

export async function createRoom(
  name: string,
  marker: string,
): Promise<{ roomCode: string; playerId: string }> {
  const res = await call<{ name: string; marker: string }, { roomCode: string; playerId: string }>("createRoom")({
    name,
    marker,
  });
  return res.data;
}

export async function joinRoom(
  roomCode: string,
  name: string,
  marker: string,
): Promise<{ roomCode: string; playerId: string }> {
  const res = await call<
    { roomCode: string; name: string; marker: string },
    { roomCode: string; playerId: string }
  >("joinRoom")({
    roomCode,
    name,
    marker,
  });
  return res.data;
}

export async function startGame(roomCode: string, targetScore: number): Promise<void> {
  await call<{ roomCode: string; targetScore: number }, { ok: true }>("startGame")({ roomCode, targetScore });
}

export async function submitCards(roomCode: string, playerId: string, cardIds: number[]): Promise<void> {
  await call<{ roomCode: string; playerId: string; cardIds: number[] }, { ok: true }>("submitCards")({
    roomCode,
    playerId,
    cardIds,
  });
}

export async function sintoniaSubmitPicks(
  roomCode: string,
  playerId: string,
  minha: number,
  sua: number,
): Promise<void> {
  await call<{ roomCode: string; playerId: string; minha: number; sua: number }, { ok: true }>(
    "sintoniaSubmitPicks",
  )({ roomCode, playerId, minha, sua });
}

export async function czarPick(roomCode: string, playerId: string, slotId: string): Promise<void> {
  await call<{ roomCode: string; playerId: string; slotId: string }, { ok: true; ended: boolean }>("czarPick")({
    roomCode,
    playerId,
    slotId,
  });
}

export async function continueRound(roomCode: string): Promise<void> {
  await call<{ roomCode: string }, { ok: true }>("continueRound")({ roomCode });
}

export async function restartGame(roomCode: string): Promise<void> {
  await call<{ roomCode: string }, { ok: true }>("restartGame")({ roomCode });
}
