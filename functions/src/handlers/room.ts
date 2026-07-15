import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { randomCode, randomId } from "cah-game-engine";
import { db } from "../lib/db.js";
import { loadPlayers, requireAuth } from "./shared.js";

const MAX_PLAYERS = 20;

export const createRoom = onCall(async (req) => {
  const uid = requireAuth(req);
  const name = String(req.data?.name ?? "Anfitrião").trim().slice(0, 40) || "Anfitrião";

  let code = randomCode();
  for (let i = 0; i < 10; i++) {
    const ref = db.collection("rooms").doc(code);
    const snap = await ref.get();
    if (!snap.exists) {
      const playerId = randomId();
      const batch = db.batch();
      batch.set(ref, {
        code,
        status: "lobby",
        hostUid: uid,
        round: 0,
        targetScore: 7,
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
        createdAt: FieldValue.serverTimestamp(),
      });
      batch.set(ref.collection("players").doc(playerId), {
        id: playerId,
        uid,
        name,
        score: 0,
        isHost: true,
      });
      await batch.commit();
      return { roomCode: code, playerId };
    }
    code = randomCode();
  }
  throw new HttpsError("resource-exhausted", "Tente novamente.");
});

export const joinRoom = onCall(async (req) => {
  const uid = requireAuth(req);
  const code = String(req.data?.roomCode ?? "").toUpperCase().trim();
  const name = String(req.data?.name ?? "Jogador").trim().slice(0, 40) || "Jogador";
  if (!code) throw new HttpsError("invalid-argument", "Código inválido.");

  const roomRef = db.collection("rooms").doc(code);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) throw new HttpsError("not-found", "Sala não encontrada.");
  const room = roomSnap.data()!;
  if (room.status !== "lobby") {
    throw new HttpsError("failed-precondition", "A partida já começou nesta sala.");
  }

  const players = await loadPlayers(code);
  if (players.length >= MAX_PLAYERS) throw new HttpsError("failed-precondition", "Sala cheia.");

  const playerId = randomId();
  await roomRef.collection("players").doc(playerId).set({
    id: playerId,
    uid,
    name,
    score: 0,
    isHost: false,
  });
  return { roomCode: code, playerId };
});
