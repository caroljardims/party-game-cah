import { blackCardText, whiteCardText } from "cah-game-engine";
import { fillBlackCardSegments } from "../../lib/cardText.js";
import type { LastWinner } from "../../types.js";
import { FilledBlackCard } from "../FilledBlackCard.js";

interface RevealScreenProps {
  winner: LastWinner;
  isHost: boolean;
  busy: boolean;
  onContinue: () => void;
}

export function RevealScreen({ winner, isHost, busy, onContinue }: RevealScreenProps) {
  const blackText = blackCardText(winner.blackCardId);
  const answers = winner.cardIds.map(whiteCardText);
  return (
    <div className="screen screen--center">
      <p className="reveal__title">{winner.playerName} venceu a rodada!</p>
      <FilledBlackCard segments={fillBlackCardSegments(blackText, answers)} />
      {isHost ? (
        <button type="button" className="btn btn--primary" disabled={busy} onClick={onContinue}>
          Continuar
        </button>
      ) : (
        <p className="muted">Aguardando o anfitrião continuar…</p>
      )}
    </div>
  );
}
