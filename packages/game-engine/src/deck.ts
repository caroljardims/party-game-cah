import { BLACK_CARDS, WHITE_CARDS } from "./data/cards.pt-br.js";
import type { BlackCard } from "./types.js";

/** Fisher-Yates. Não muta o array recebido. */
export function shuffle<T>(items: readonly T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Ids são 1-based (posição no array de dados + 1). */
export function buildWhiteDeck(): number[] {
  return shuffle(WHITE_CARDS.map((_, i) => i + 1));
}

export function buildBlackDeck(): number[] {
  return shuffle(BLACK_CARDS.map((_, i) => i + 1));
}

export function whiteCardText(id: number): string {
  const text = WHITE_CARDS[id - 1];
  if (text === undefined) throw new Error(`Carta branca inválida: ${id}`);
  return text;
}

export function blackCardText(id: number): string {
  const seed = BLACK_CARDS[id - 1];
  if (seed === undefined) throw new Error(`Carta preta inválida: ${id}`);
  return seed.text;
}

export function blackCardPick(id: number): 1 | 2 {
  const seed = BLACK_CARDS[id - 1];
  if (seed === undefined) throw new Error(`Carta preta inválida: ${id}`);
  return seed.pick;
}

/** Retira `count` ids do topo do deck. Se o deck acabar, embaralha um novo baralho completo. */
export function drawWhiteCards(
  deck: number[],
  count: number,
): { drawn: number[]; deckRemaining: number[] } {
  let remaining = deck;
  const drawn: number[] = [];
  while (drawn.length < count) {
    if (remaining.length === 0) remaining = buildWhiteDeck();
    const next = remaining[0]!;
    drawn.push(next);
    remaining = remaining.slice(1);
  }
  return { drawn, deckRemaining: remaining };
}

export function drawBlackCard(deck: number[]): { card: BlackCard; deckRemaining: number[] } {
  let remaining = deck;
  if (remaining.length === 0) remaining = buildBlackDeck();
  const id = remaining[0]!;
  return {
    card: { id, pick: blackCardPick(id) },
    deckRemaining: remaining.slice(1),
  };
}

export function dealInitialHand(deck: number[]): { hand: number[]; deckRemaining: number[] } {
  const { drawn, deckRemaining } = drawWhiteCards(deck, 10);
  return { hand: drawn, deckRemaining };
}
