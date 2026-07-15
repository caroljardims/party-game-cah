import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  buildBlackDeck,
  buildJudgingSlots,
  buildWhiteDeck,
  checkWinner,
  dealInitialHand,
  drawBlackCard,
  nextCzar,
  replenishHand,
  shuffle,
} from "cah-game-engine";
import { db } from "../lib/db.js";
import { assertHost, loadPlayers, requireAuth, requirePlayer, requireRoom } from "./shared.js";

const MIN_PLAYERS = 3;

export const startGame = onCall(async (req) => {
  const uid = requireAuth(req);
  const code = String(req.data?.roomCode ?? "").toUpperCase().trim();
  const targetScoreRaw = Number(req.data?.targetScore ?? 7);
  const targetScore = Number.isFinite(targetScoreRaw) ? Math.min(Math.max(Math.round(targetScoreRaw), 3), 30) : 7;

  const roomRef = db.collection("rooms").doc(code);
  const roomSnap = await roomRef.get();
  const room = requireRoom(roomSnap.data());
  assertHost(room, uid);
  if (room.status !== "lobby") throw new HttpsError("failed-precondition", "A partida já começou.");

  const players = await loadPlayers(code);
  if (players.length < MIN_PLAYERS) {
    throw new HttpsError("failed-precondition", `São necessários pelo menos ${MIN_PLAYERS} jogadores.`);
  }

  let whiteDeck = buildWhiteDeck();
  const blackDeck = buildBlackDeck();

  const batch = db.batch();
  for (const player of players) {
    const { hand, deckRemaining } = dealInitialHand(whiteDeck);
    whiteDeck = deckRemaining;
    batch.set(roomRef.collection("hands").doc(player.id), { uid: player.uid, cardIds: hand });
  }

  const playerOrder = shuffle(players.map((p) => p.id));
  const czarPlayerId = playerOrder[0]!;
  const { card: blackCard, deckRemaining: blackDeckRemaining } = drawBlackCard(blackDeck);

  batch.update(roomRef, {
    status: "submitting",
    round: 1,
    targetScore,
    czarPlayerId,
    playerOrder,
    blackCardId: blackCard.id,
    blackCardPick: blackCard.pick,
    blackDeckRemaining,
    whiteDeckRemaining: whiteDeck,
    whiteDiscard: [],
    submittedPlayerIds: [],
    judgingSlots: null,
    lastWinner: null,
    winnerPlayerId: null,
  });
  await batch.commit();
  return { ok: true };
});

export const submitCards = onCall(async (req) => {
  const uid = requireAuth(req);
  const code = String(req.data?.roomCode ?? "").toUpperCase().trim();
  const playerId = String(req.data?.playerId ?? "");
  const cardIds = Array.isArray(req.data?.cardIds) ? req.data.cardIds.map(Number) : [];

  const roomRef = db.collection("rooms").doc(code);
  const roomSnap = await roomRef.get();
  const room = requireRoom(roomSnap.data());
  if (room.status !== "submitting") throw new HttpsError("failed-precondition", "Não é hora de responder.");

  const players = await loadPlayers(code);
  const me = requirePlayer(players, playerId, uid);
  if (me.id === room.czarPlayerId) throw new HttpsError("permission-denied", "O Card Czar não joga cartas.");

  const submitted: string[] = room.submittedPlayerIds ?? [];
  if (submitted.includes(me.id)) throw new HttpsError("failed-precondition", "Você já enviou sua jogada.");

  const pick = Number(room.blackCardPick ?? 1);
  if (cardIds.length !== pick || new Set(cardIds).size !== cardIds.length) {
    throw new HttpsError("invalid-argument", `Escolha exatamente ${pick} carta(s).`);
  }

  const handRef = roomRef.collection("hands").doc(me.id);
  const handSnap = await handRef.get();
  const hand: number[] = handSnap.data()?.cardIds ?? [];
  if (!cardIds.every((id: number) => hand.includes(id))) {
    throw new HttpsError("invalid-argument", "Carta fora da sua mão.");
  }

  await roomRef.collection("submissions").doc(me.id).set({ cardIds });

  const newSubmitted = [...submitted, me.id];
  const activeNonCzar = players.filter((p) => p.id !== room.czarPlayerId).map((p) => p.id);
  const allSubmitted = activeNonCzar.every((id) => newSubmitted.includes(id));

  if (!allSubmitted) {
    await roomRef.update({ submittedPlayerIds: FieldValue.arrayUnion(me.id) });
    return { ok: true };
  }

  // Todo mundo enviou — monta os slots embaralhados e anônimos pro Czar julgar.
  const subsSnap = await roomRef.collection("submissions").get();
  const submissions = subsSnap.docs.map((d) => ({ playerId: d.id, cardIds: (d.data().cardIds as number[]) ?? [] }));
  const { slots, slotToPlayer } = buildJudgingSlots(submissions);

  const batch = db.batch();
  batch.update(roomRef, { submittedPlayerIds: newSubmitted, judgingSlots: slots, status: "judging" });
  batch.set(roomRef.collection("judgingSecrets").doc("current"), { slotToPlayer });
  await batch.commit();
  return { ok: true };
});

export const czarPick = onCall(async (req) => {
  const uid = requireAuth(req);
  const code = String(req.data?.roomCode ?? "").toUpperCase().trim();
  const playerId = String(req.data?.playerId ?? "");
  const slotId = String(req.data?.slotId ?? "");

  const roomRef = db.collection("rooms").doc(code);
  const roomSnap = await roomRef.get();
  const room = requireRoom(roomSnap.data());
  if (room.status !== "judging") throw new HttpsError("failed-precondition", "Não é hora de julgar.");

  const players = await loadPlayers(code);
  const me = requirePlayer(players, playerId, uid);
  if (me.id !== room.czarPlayerId) throw new HttpsError("permission-denied", "Só o Card Czar julga esta rodada.");

  const slots: Array<{ slotId: string; cardIds: number[] }> = room.judgingSlots ?? [];
  const winningSlot = slots.find((s) => s.slotId === slotId);
  if (!winningSlot) throw new HttpsError("invalid-argument", "Combinação inválida.");

  const secretsSnap = await roomRef.collection("judgingSecrets").doc("current").get();
  const slotToPlayer: Record<string, string> = secretsSnap.data()?.slotToPlayer ?? {};
  const winnerPlayerId = slotToPlayer[slotId];
  if (!winnerPlayerId) throw new HttpsError("internal", "Não foi possível identificar o vencedor.");

  const winnerPlayer = players.find((p) => p.id === winnerPlayerId);
  if (!winnerPlayer) throw new HttpsError("internal", "Jogador vencedor não encontrado.");

  const newScore = winnerPlayer.score + 1;
  const submittedPlayerIds: string[] = room.submittedPlayerIds ?? [];

  const batch = db.batch();
  batch.update(roomRef.collection("players").doc(winnerPlayerId), { score: newScore });

  const updatedPlayers = players.map((p) => (p.id === winnerPlayerId ? { ...p, score: newScore } : p));
  const winner = checkWinner(updatedPlayers, Number(room.targetScore ?? 7));

  const lastWinner = {
    slotId,
    playerId: winnerPlayerId,
    playerName: winnerPlayer.name,
    cardIds: winningSlot.cardIds,
    blackCardId: Number(room.blackCardId),
  };

  // Limpa as submissões e o mapa secreto da rodada, sala ou não sala.
  for (const pid of submittedPlayerIds) {
    batch.delete(roomRef.collection("submissions").doc(pid));
  }
  batch.delete(roomRef.collection("judgingSecrets").doc("current"));

  if (winner) {
    batch.update(roomRef, {
      status: "ended",
      winnerPlayerId: winner,
      judgingSlots: null,
      lastWinner,
    });
    await batch.commit();
    return { ok: true, ended: true };
  }

  // Repõe as mãos de quem jogou nesta rodada e sorteia a próxima carta preta.
  let whiteDeckRemaining: number[] = room.whiteDeckRemaining ?? [];
  let whiteDiscard: number[] = room.whiteDiscard ?? [];
  for (const pid of submittedPlayerIds) {
    const handRef = roomRef.collection("hands").doc(pid);
    const handSnap = await handRef.get();
    const hand: number[] = handSnap.data()?.cardIds ?? [];
    const submissionCardIds =
      pid === winnerPlayerId ? winningSlot.cardIds : (slots.find((s) => slotToPlayer[s.slotId] === pid)?.cardIds ?? []);
    const replenished = replenishHand(hand, submissionCardIds, whiteDeckRemaining, whiteDiscard);
    whiteDeckRemaining = replenished.whiteDeckRemaining;
    whiteDiscard = replenished.whiteDiscard;
    batch.set(handRef, { cardIds: replenished.hand }, { merge: true });
  }

  const activePlayerIds = new Set(players.map((p) => p.id));
  const playerOrder: string[] = room.playerOrder ?? [];
  const newCzar = nextCzar(playerOrder, room.czarPlayerId, activePlayerIds);
  const { card: nextBlackCard, deckRemaining: blackDeckRemaining } = drawBlackCard(room.blackDeckRemaining ?? []);

  batch.update(roomRef, {
    status: "submitting",
    round: FieldValue.increment(1),
    czarPlayerId: newCzar,
    blackCardId: nextBlackCard.id,
    blackCardPick: nextBlackCard.pick,
    blackDeckRemaining,
    whiteDeckRemaining,
    whiteDiscard,
    submittedPlayerIds: [],
    judgingSlots: null,
    lastWinner,
  });
  await batch.commit();
  return { ok: true, ended: false };
});

export const restartGame = onCall(async (req) => {
  const uid = requireAuth(req);
  const code = String(req.data?.roomCode ?? "").toUpperCase().trim();

  const roomRef = db.collection("rooms").doc(code);
  const roomSnap = await roomRef.get();
  const room = requireRoom(roomSnap.data());
  assertHost(room, uid);
  if (room.status !== "ended") throw new HttpsError("failed-precondition", "A partida ainda não terminou.");

  const players = await loadPlayers(code);
  const batch = db.batch();
  for (const player of players) {
    batch.update(roomRef.collection("players").doc(player.id), { score: 0 });
  }
  batch.update(roomRef, {
    status: "lobby",
    round: 0,
    czarPlayerId: null,
    playerOrder: [],
    blackCardId: null,
    blackCardPick: null,
    blackDeckRemaining: [],
    whiteDeckRemaining: [],
    whiteDiscard: [],
    submittedPlayerIds: [],
    judgingSlots: null,
    lastWinner: null,
    winnerPlayerId: null,
  });
  await batch.commit();

  await db.recursiveDelete(roomRef.collection("hands"));
  await db.recursiveDelete(roomRef.collection("submissions"));
  await db.recursiveDelete(roomRef.collection("judgingSecrets"));
  return { ok: true };
});
