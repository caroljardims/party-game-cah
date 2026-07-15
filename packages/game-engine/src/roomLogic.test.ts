import { describe, expect, it } from "vitest";
import { buildJudgingSlots, checkWinner, nextCzar, replenishHand } from "./roomLogic.js";

describe("nextCzar", () => {
  it("avança para o próximo jogador na ordem", () => {
    const order = ["a", "b", "c"];
    const active = new Set(order);
    expect(nextCzar(order, "a", active)).toBe("b");
    expect(nextCzar(order, "b", active)).toBe("c");
    expect(nextCzar(order, "c", active)).toBe("a");
  });

  it("pula jogadores que saíram da sala", () => {
    const order = ["a", "b", "c"];
    const active = new Set(["a", "c"]);
    expect(nextCzar(order, "a", active)).toBe("c");
  });
});

describe("checkWinner", () => {
  it("retorna o id de quem atingiu a pontuação alvo", () => {
    const players = [
      { id: "a", score: 3 },
      { id: "b", score: 7 },
    ];
    expect(checkWinner(players, 7)).toBe("b");
  });

  it("retorna null se ninguém atingiu", () => {
    const players = [{ id: "a", score: 3 }];
    expect(checkWinner(players, 7)).toBeNull();
  });
});

describe("replenishHand", () => {
  it("remove as cartas jogadas e repõe até 10", () => {
    const hand = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const deckRemaining = [11, 12, 13];
    const { hand: newHand, whiteDeckRemaining, whiteDiscard } = replenishHand(
      hand,
      [1, 2],
      deckRemaining,
      [],
    );
    expect(newHand.length).toBe(10);
    expect(newHand).toContain(11);
    expect(newHand).toContain(12);
    expect(whiteDeckRemaining).toEqual([13]);
    expect(whiteDiscard).toEqual([1, 2]);
  });

  it("reembaralha o descarte quando o baralho não tem cartas suficientes", () => {
    const hand = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const { hand: newHand, whiteDeckRemaining, whiteDiscard } = replenishHand(
      hand,
      [1, 2],
      [],
      [100, 101],
    );
    expect(newHand.length).toBe(10);
    // descarte antigo (100,101) + cartas jogadas (1,2) = 4 cartas voltam pro baralho;
    // só 2 são necessárias pra repor a mão, então sobram 2 no deck e 0 no descarte.
    expect(whiteDeckRemaining.length).toBe(2);
    expect(whiteDiscard.length).toBe(0);
  });
});

describe("buildJudgingSlots", () => {
  it("mapeia cada slot de volta ao playerId sem revelar ordem original", () => {
    const submissions = [
      { playerId: "p1", cardIds: [1, 2] },
      { playerId: "p2", cardIds: [3, 4] },
      { playerId: "p3", cardIds: [5, 6] },
    ];
    const { slots, slotToPlayer } = buildJudgingSlots(submissions);
    expect(slots.length).toBe(3);
    const slotIds = slots.map((s) => s.slotId);
    expect(new Set(slotIds).size).toBe(3);
    for (const slot of slots) {
      const owner = slotToPlayer[slot.slotId];
      const original = submissions.find((s) => s.playerId === owner);
      expect(original?.cardIds).toEqual(slot.cardIds);
    }
  });
});
