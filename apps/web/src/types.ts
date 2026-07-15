export type RoomStatus = "lobby" | "submitting" | "judging" | "ended";

export interface JudgingSlot {
  slotId: string;
  cardIds: number[];
}

export interface LastWinner {
  slotId: string;
  playerId: string;
  playerName: string;
  cardIds: number[];
  blackCardId: number;
}

export interface RoomDoc {
  code: string;
  status: RoomStatus;
  hostUid: string;
  round: number;
  targetScore: number;
  czarPlayerId: string | null;
  playerOrder: string[];
  blackCardId: number | null;
  blackCardPick: 1 | 2 | null;
  submittedPlayerIds: string[];
  judgingSlots: JudgingSlot[] | null;
  lastWinner: LastWinner | null;
  winnerPlayerId: string | null;
}

export interface PlayerDoc {
  id: string;
  uid: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface HandDoc {
  uid: string;
  cardIds: number[];
}

export interface Session {
  roomCode: string;
  playerId: string;
}
