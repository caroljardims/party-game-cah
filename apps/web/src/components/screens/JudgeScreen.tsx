import { whiteCardText } from "cah-game-engine";
import { fillBlackCardSegments } from "../../lib/cardText.js";
import type { JudgingSlot } from "../../types.js";
import { FilledBlackCard } from "../FilledBlackCard.js";

interface JudgeScreenProps {
  blackText: string;
  slots: JudgingSlot[];
  busy: boolean;
  isCzar: boolean;
  onPick?: (slotId: string) => void;
}

export function JudgeScreen({ blackText, slots, busy, isCzar, onPick }: JudgeScreenProps) {
  return (
    <div className="screen">
      <p className="muted">
        {isCzar
          ? "Você é o Card Czar. Leia cada combinação em voz alta e escolha a mais engraçada."
          : "O Card Czar está escolhendo a resposta mais engraçada…"}
      </p>
      <div className="slot-list">
        {slots.map((slot) => {
          const answers = slot.cardIds.map(whiteCardText);
          const card = <FilledBlackCard segments={fillBlackCardSegments(blackText, answers)} />;
          if (!isCzar || !onPick) {
            return (
              <div key={slot.slotId} className="slot slot--readonly">
                {card}
              </div>
            );
          }
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
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
