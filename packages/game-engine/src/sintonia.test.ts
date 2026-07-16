import { describe, expect, it } from "vitest";
import { blackCardPick, buildBlackDeck } from "./deck.js";
import {
  discardMinhaAndReplenish,
  filterBlackDeckPick1,
  pickRandomMarkers,
  scoreSintoniaRound,
} from "./sintonia.js";

describe("scoreSintoniaRound", () => {
  it("dá 2 quando os dois se leem", () => {
    expect(scoreSintoniaRound({ minha: 3, sua: 7 }, { minha: 7, sua: 3 })).toBe(2);
  });

  it("dá 1 quando só um acerta", () => {
    expect(scoreSintoniaRound({ minha: 3, sua: 7 }, { minha: 1, sua: 3 })).toBe(1);
  });

  it("dá 0 no desencontro total", () => {
    expect(scoreSintoniaRound({ minha: 0, sua: 1 }, { minha: 2, sua: 3 })).toBe(0);
  });

  it("aceita Minha e Sua iguais no mesmo jogador", () => {
    expect(scoreSintoniaRound({ minha: 5, sua: 5 }, { minha: 5, sua: 5 })).toBe(2);
  });
});

describe("discardMinhaAndReplenish", () => {
  it("descarta só as posições Minha e repõe até 10", () => {
    const table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const { tableCardIds, whiteDeckRemaining, whiteDiscard } = discardMinhaAndReplenish(
      table,
      [0, 5],
      [11, 12, 13],
      [],
    );
    expect(tableCardIds).toHaveLength(10);
    expect(tableCardIds).not.toContain(1);
    expect(tableCardIds).not.toContain(6);
    expect(tableCardIds).toContain(11);
    expect(tableCardIds).toContain(12);
    expect(whiteDeckRemaining).toEqual([13]);
    expect(whiteDiscard).toEqual([1, 6]);
  });

  it("se os dois apontam a mesma Minha, descarta uma vez só", () => {
    const table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const { tableCardIds, whiteDiscard } = discardMinhaAndReplenish(table, [4, 4], [20], []);
    expect(tableCardIds).toHaveLength(10);
    expect(whiteDiscard).toEqual([5]);
    expect(tableCardIds).toContain(20);
  });

  it("cartas só apontadas como Sua permanecem", () => {
    const table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // Minha só na posição 0; posição 9 foi Só Sua (não entra em minhaIndices)
    const { tableCardIds } = discardMinhaAndReplenish(table, [0], [99], []);
    expect(tableCardIds).toContain(10);
    expect(tableCardIds).not.toContain(1);
  });
});

describe("filterBlackDeckPick1", () => {
  it("retorna só cartas pick 1", () => {
    const deck = buildBlackDeck();
    const filtered = filterBlackDeckPick1(deck);
    expect(filtered.length).toBeGreaterThan(0);
    for (const id of filtered) {
      expect(blackCardPick(id)).toBe(1);
    }
  });
});

describe("pickRandomMarkers", () => {
  it("sorteia a quantidade pedida", () => {
    const picked = pickRandomMarkers(8);
    expect(picked).toHaveLength(8);
    expect(new Set(picked).size).toBe(8);
  });

  it("exclui marcadores já usados", () => {
    const exclude = ["🔥", "💎", "🌙"];
    const picked = pickRandomMarkers(8, exclude);
    expect(picked).toHaveLength(8);
    for (const m of exclude) {
      expect(picked).not.toContain(m);
    }
  });
});
