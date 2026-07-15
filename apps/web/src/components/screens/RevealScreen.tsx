import { blackCardText, whiteCardText } from "cah-game-engine";
import { fillBlackCard } from "../../lib/cardText.js";
import type { LastWinner } from "../../types.js";
import { Card } from "../Card.js";

interface RevealScreenProps {
  winner: LastWinner;
  onContinue: () => void;
}

export function RevealScreen({ winner, onContinue }: RevealScreenProps) {
  const blackText = blackCardText(winner.blackCardId);
  const answers = winner.cardIds.map(whiteCardText);
  return (
    <div className="screen screen--center">
      <p className="reveal__title">{winner.playerName} venceu a rodada!</p>
      <Card kind="black" text={blackText} />
      <p className="slot__preview">{fillBlackCard(blackText, answers)}</p>
      <button type="button" className="btn btn--primary" onClick={onContinue}>
        Continuar
      </button>
    </div>
  );
}
