import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../lib/db.js";

export function requireAuth(req: CallableRequest): string {
  if (!req.auth?.uid) throw new HttpsError("unauthenticated", "Auth obrigatória.");
  return req.auth.uid;
}

export interface PlayerDoc {
  id: string;
  uid: string;
  name: string;
  score: number;
  isHost: boolean;
  marker?: string;
}

export async function loadPlayers(roomCode: string): Promise<PlayerDoc[]> {
  const snap = await db.collection("rooms").doc(roomCode).collection("players").get();
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ ...(d.data() as PlayerDoc), id: d.id }));
}

/** Confirma que `req.auth.uid` é dono de `playerId` nesta sala. */
export function requirePlayer(players: PlayerDoc[], playerId: string, uid: string): PlayerDoc {
  const player = players.find((p) => p.id === playerId);
  if (!player) throw new HttpsError("not-found", "Jogador não encontrado nesta sala.");
  if (player.uid !== uid) throw new HttpsError("permission-denied", "Esta sessão não é deste jogador.");
  return player;
}

export function requireRoom(data: FirebaseFirestore.DocumentData | undefined) {
  if (!data) throw new HttpsError("not-found", "Sala não encontrada.");
  return data;
}

export function assertHost(room: FirebaseFirestore.DocumentData, uid: string): void {
  if (room.hostUid !== uid) throw new HttpsError("permission-denied", "Apenas o anfitrião pode fazer isso.");
}
