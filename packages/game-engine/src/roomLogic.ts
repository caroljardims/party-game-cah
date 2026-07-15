import { drawWhiteCards, shuffle } from "./deck.js";
import { randomId } from "./ids.js";
import type { JudgingSlot } from "./types.js";

/** Próximo Czar na rotação fixa `playerOrder`. Pula ids que não estão mais na sala. */
export function nextCzar(playerOrder: string[], currentCzarId: string, activePlayerIds: Set<string>): string {
  const order = playerOrder.filter((id) => activePlayerIds.has(id));
  if (order.length === 0) throw new Error("Nenhum jogador ativo.");
  const idx = order.indexOf(currentCzarId);
  const nextIdx = idx === -1 ? 0 : (idx + 1) % order.length;
  return order[nextIdx]!;
}

export function checkWinner(
  players: readonly { id: string; score: number }[],
  targetScore: number,
): string | null {
  const winner = players.find((p) => p.score >= targetScore);
  return winner ? winner.id : null;
}

/** Remove as cartas jogadas da mão e repõe até 10, embaralhando o descarte de volta quando o baralho esvazia. */
export function replenishHand(
  hand: number[],
  playedCardIds: number[],
  whiteDeckRemaining: number[],
  whiteDiscard: number[],
): { hand: number[]; whiteDeckRemaining: number[]; whiteDiscard: number[] } {
  const played = new Set(playedCardIds);
  const remainingHand = hand.filter((id) => !played.has(id));
  const need = 10 - remainingHand.length;
  let deck = whiteDeckRemaining;
  let discard = [...whiteDiscard, ...playedCardIds];
  if (need > deck.length && discard.length > 0) {
    deck = [...deck, ...shuffle(discard)];
    discard = [];
  }
  const { drawn, deckRemaining } = drawWhiteCards(deck, Math.max(need, 0));
  return {
    hand: [...remainingHand, ...drawn],
    whiteDeckRemaining: deckRemaining,
    whiteDiscard: discard,
  };
}

/** Embaralha as submissões e atribui um slotId aleatório — a ordem/slotId não revelam autoria. */
export function buildJudgingSlots(
  submissions: readonly { playerId: string; cardIds: number[] }[],
): { slots: JudgingSlot[]; slotToPlayer: Record<string, string> } {
  const shuffled = shuffle(submissions);
  const slots: JudgingSlot[] = [];
  const slotToPlayer: Record<string, string> = {};
  for (const sub of shuffled) {
    const slotId = randomId();
    slots.push({ slotId, cardIds: sub.cardIds });
    slotToPlayer[slotId] = sub.playerId;
  }
  return { slots, slotToPlayer };
}
