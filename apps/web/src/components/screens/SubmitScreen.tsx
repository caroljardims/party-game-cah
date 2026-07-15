import { useState } from "react";
import { whiteCardText } from "cah-game-engine";
import { Card } from "../Card.js";

interface SubmitScreenProps {
  blackText: string;
  pick: 1 | 2;
  hand: number[];
  busy: boolean;
  onSubmit: (cardIds: number[]) => void;
}

export function SubmitScreen({ blackText, pick, hand, busy, onSubmit }: SubmitScreenProps) {
  const [selected, setSelected] = useState<number[]>([]);

  function toggle(cardId: number) {
    setSelected((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= pick) return pick === 1 ? [cardId] : prev;
      return [...prev, cardId];
    });
  }

  return (
    <div className="screen">
      <Card kind="black" text={blackText} pick={pick} />
      <p className="muted">
        {pick === 1 ? "Escolha 1 carta." : `Escolha 2 cartas, na ordem que devem ser lidas (${selected.length}/2).`}
      </p>
      <div className="hand-grid">
        {hand.map((cardId) => {
          const order = selected.indexOf(cardId);
          return (
            <div key={cardId} className="hand-slot">
              <Card
                kind="white"
                text={whiteCardText(cardId)}
                selected={order !== -1}
                onClick={() => toggle(cardId)}
              />
              {order !== -1 && pick === 2 && <span className="order-badge">{order + 1}</span>}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="btn btn--primary btn--sticky"
        disabled={selected.length !== pick || busy}
        onClick={() => onSubmit(selected)}
      >
        Enviar resposta
      </button>
    </div>
  );
}
