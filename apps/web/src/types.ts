export type RoomStatus = "lobby" | "submitting" | "judging" | "ended";
export type GameMode = "classic" | "sintonia";

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

export interface SintoniaRevealPick {
  playerId: string;
  playerName: string;
  marker: string;
  minha: number;
  sua: number;
}

export interface SintoniaReveal {
  blackCardId: number;
  roundPoints: 0 | 1 | 2;
  picks: SintoniaRevealPick[];
}

export interface RoomDoc {
  code: string;
  status: RoomStatus;
  mode: GameMode | null;
  hostUid: string;
  round: number;
  targetScore: number;
  sharedScore: number;
  czarPlayerId: string | null;
  playerOrder: string[];
  blackCardId: number | null;
  blackCardPick: 1 | 2 | null;
  tableCardIds: number[];
  submittedPlayerIds: string[];
  judgingSlots: JudgingSlot[] | null;
  lastWinner: LastWinner | null;
  sintoniaReveal: SintoniaReveal | null;
  winnerPlayerId: string | null;
}

export interface PlayerDoc {
  id: string;
  uid: string;
  name: string;
  score: number;
  isHost: boolean;
  marker: string;
}

export interface HandDoc {
  uid: string;
  cardIds: number[];
}

export interface Session {
  roomCode: string;
  playerId: string;
}
