import { whiteCardText } from "cah-game-engine";
import { fillBlackCard } from "../../lib/cardText.js";
import type { JudgingSlot } from "../../types.js";
import { Card } from "../Card.js";

interface JudgeScreenProps {
  blackText: string;
  pick: 1 | 2;
  slots: JudgingSlot[];
  busy: boolean;
  onPick: (slotId: string) => void;
}

export function JudgeScreen({ blackText, pick, slots, busy, onPick }: JudgeScreenProps) {
  return (
    <div className="screen">
      <Card kind="black" text={blackText} pick={pick} />
      <p className="muted">Você é o Card Czar. Leia cada combinação em voz alta e escolha a mais engraçada.</p>
      <div className="slot-list">
        {slots.map((slot) => {
          const answers = slot.cardIds.map(whiteCardText);
          return (
            <div
              key={slot.slotId}
              role="button"
              tabIndex={0}
              aria-disabled={busy}
              className="slot"
              onClick={() => !busy && onPick(slot.slotId)}
              onKeyDown={(e) => {
                if (!busy && (e.key === "Enter" || e.key === " ")) onPick(slot.slotId);
              }}
            >
              <p className="slot__preview">{fillBlackCard(blackText, answers)}</p>
              <div className="slot__cards">
                {answers.map((text, i) => (
                  <Card key={i} kind="white" text={text} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
