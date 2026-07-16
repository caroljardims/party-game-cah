export type RoomStatus = "lobby" | "submitting" | "judging" | "ended";

export type GameMode = "classic" | "sintonia";

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

export interface BlackCard {
  id: number;
  pick: 1 | 2;
}

export interface JudgingSlot {
  slotId: string;
  cardIds: number[];
}

export interface LastWinner {
  slotId: string;
  playerId: string;
  playerName: string;
  cardIds: number[];
  /** Id da carta preta desta rodada julgada — `blackCardId` na sala já aponta pra próxima. */
  blackCardId: number;
}
