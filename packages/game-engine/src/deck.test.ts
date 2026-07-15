import { describe, expect, it } from "vitest";
import { WHITE_CARDS, BLACK_CARDS } from "./data/cards.pt-br.js";
import {
  buildBlackDeck,
  buildWhiteDeck,
  dealInitialHand,
  drawBlackCard,
  drawWhiteCards,
  blackCardText,
  whiteCardText,
} from "./deck.js";

describe("cards.pt-br data", () => {
  it("tem 460 cartas brancas sem duplicata", () => {
    expect(WHITE_CARDS.length).toBe(460);
    expect(new Set(WHITE_CARDS).size).toBe(WHITE_CARDS.length);
  });

  it("tem 90 cartas pretas (76 pick 1 + 14 pick 2)", () => {
    expect(BLACK_CARDS.length).toBe(90);
    expect(BLACK_CARDS.filter((c) => c.pick === 1).length).toBe(76);
    expect(BLACK_CARDS.filter((c) => c.pick === 2).length).toBe(14);
  });
});

describe("buildWhiteDeck / buildBlackDeck", () => {
  it("contém todos os ids exatamente uma vez", () => {
    const white = buildWhiteDeck();
    expect(white.length).toBe(WHITE_CARDS.length);
    expect(new Set(white).size).toBe(WHITE_CARDS.length);

    const black = buildBlackDeck();
    expect(black.length).toBe(BLACK_CARDS.length);
    expect(new Set(black).size).toBe(BLACK_CARDS.length);
  });
});

describe("drawWhiteCards", () => {
  it("retira do topo e reduz o restante", () => {
    const deck = buildWhiteDeck();
    const { drawn, deckRemaining } = drawWhiteCards(deck, 10);
    expect(drawn.length).toBe(10);
    expect(deckRemaining.length).toBe(deck.length - 10);
    expect(new Set(drawn).size).toBe(10);
  });

  it("reembaralha um baralho novo quando esvazia", () => {
    const { drawn, deckRemaining } = drawWhiteCards([], 5);
    expect(drawn.length).toBe(5);
    expect(deckRemaining.length).toBe(WHITE_CARDS.length - 5);
  });
});

describe("dealInitialHand", () => {
  it("distribui exatamente 10 cartas", () => {
    const deck = buildWhiteDeck();
    const { hand, deckRemaining } = dealInitialHand(deck);
    expect(hand.length).toBe(10);
    expect(deckRemaining.length).toBe(deck.length - 10);
  });
});

describe("drawBlackCard", () => {
  it("retorna id + pick corretos e resolve o texto", () => {
    const deck = buildBlackDeck();
    const { card, deckRemaining } = drawBlackCard(deck);
    expect(deckRemaining.length).toBe(deck.length - 1);
    expect(blackCardText(card.id)).toBe(BLACK_CARDS[card.id - 1]!.text);
    expect(card.pick).toBe(BLACK_CARDS[card.id - 1]!.pick);
  });
});

describe("whiteCardText / blackCardText", () => {
  it("resolve o texto certo pelo id 1-based", () => {
    expect(whiteCardText(1)).toBe(WHITE_CARDS[0]);
    expect(whiteCardText(WHITE_CARDS.length)).toBe(WHITE_CARDS[WHITE_CARDS.length - 1]);
  });

  it("lança erro para id fora do range", () => {
    expect(() => whiteCardText(0)).toThrow();
    expect(() => whiteCardText(WHITE_CARDS.length + 1)).toThrow();
  });
});
