import { blackCardPick, buildBlackDeck, drawWhiteCards, shuffle } from "./deck.js";

export interface SintoniaPick {
  minha: number;
  sua: number;
}

/** Pontuação compartilhada da rodada: Minha de A bate Sua de B, e vice-versa. */
export function scoreSintoniaRound(a: SintoniaPick, b: SintoniaPick): 0 | 1 | 2 {
  let points = 0;
  if (a.minha === b.sua) points += 1;
  if (b.minha === a.sua) points += 1;
  return points as 0 | 1 | 2;
}

/** Remove cartas apontadas como Minha e repõe a mesa até 10. */
export function discardMinhaAndReplenish(
  tableCardIds: number[],
  minhaIndices: readonly number[],
  whiteDeckRemaining: number[],
  whiteDiscard: number[],
): { tableCardIds: number[]; whiteDeckRemaining: number[]; whiteDiscard: number[] } {
  const uniqueIndices = [...new Set(minhaIndices)].filter((i) => i >= 0 && i < tableCardIds.length);
  const discardedIds = uniqueIndices.map((i) => tableCardIds[i]!);
  const keep = tableCardIds.filter((_, i) => !uniqueIndices.includes(i));
  let deck = whiteDeckRemaining;
  let discard = [...whiteDiscard, ...discardedIds];
  const need = 10 - keep.length;
  if (need > deck.length && discard.length > 0) {
    deck = [...deck, ...shuffle(discard)];
    discard = [];
  }
  const { drawn, deckRemaining } = drawWhiteCards(deck, Math.max(need, 0));
  return {
    tableCardIds: [...keep, ...drawn],
    whiteDeckRemaining: deckRemaining,
    whiteDiscard: discard,
  };
}

/** Baralho preto só com Pick 1 (ids). Se `deck` vier vazio, monta um novo filtrado. */
export function filterBlackDeckPick1(deck: readonly number[]): number[] {
  const source = deck.length > 0 ? deck : buildBlackDeck();
  const filtered = source.filter((id) => blackCardPick(id) === 1);
  if (filtered.length > 0) return filtered;
  return buildBlackDeck().filter((id) => blackCardPick(id) === 1);
}

export function drawBlackCardPick1(deck: number[]): {
  cardId: number;
  deckRemaining: number[];
} {
  let remaining = filterBlackDeckPick1(deck);
  if (remaining.length === 0) remaining = filterBlackDeckPick1([]);
  const cardId = remaining[0]!;
  return { cardId, deckRemaining: remaining.slice(1) };
}

export const SINTONIA_ROUNDS = 10;
export const SINTONIA_MAX_SCORE = 20;

/**
 * Pool sem bandeiras e sem pictogramas novos/frágeis no Segoe UI Emoji (Windows).
 * Só emojis comuns, bem suportados nos browsers.
 */
export const MARKER_POOL = [
  "🔥",
  "💎",
  "🌙",
  "🍀",
  "⚡",
  "🎯",
  "🦄",
  "🍕",
  "🦊",
  "🐸",
  "🐙",
  "🦋",
  "🌟",
  "💀",
  "🎭",
  "🚀",
  "🌈",
  "🍩",
  "🥑",
  "🎸",
  "👾",
  "🌵",
  "🧠",
  "💣",
  "🐻",
  "🐱",
  "👑",
  "🐶",
  "🌸",
  "☀️",
  "❄️",
  "🎵",
  "🎲",
  "🏀",
  "🌮",
  "🧁",
  "🦉",
  "🐝",
  "🐢",
  "🐧",
] as const;

/** @deprecated use MARKER_POOL + pickRandomMarkers */
export const PLAYER_MARKERS = MARKER_POOL.slice(0, 8);

export type PlayerMarker = string;

/** Sorteia `count` emojis distintos, excluindo os já usados na sala. */
export function pickRandomMarkers(count = 8, exclude: readonly string[] = []): string[] {
  const blocked = new Set(exclude);
  const available = MARKER_POOL.filter((m) => !blocked.has(m));
  const n = Math.min(Math.max(1, count), available.length);
  if (n === 0) return [];
  return shuffle([...available]).slice(0, n);
}

export function normalizeMarker(raw: unknown): string {
  const value = String(raw ?? "").trim();
  if ((MARKER_POOL as readonly string[]).includes(value)) return value;
  return MARKER_POOL[0]!;
}
