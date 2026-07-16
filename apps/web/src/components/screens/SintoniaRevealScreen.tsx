import { blackCardText, SINTONIA_MAX_SCORE, whiteCardText } from "cah-game-engine";
import { fillBlackCardSegments } from "../../lib/cardText.js";
import type { SintoniaReveal, SintoniaRevealPick } from "../../types.js";
import { FilledBlackCard } from "../FilledBlackCard.js";

interface SintoniaRevealScreenProps {
  reveal: SintoniaReveal;
  tableCardIds: number[];
  sharedScore: number;
  round: number;
  isHost: boolean;
  busy: boolean;
  onContinue: () => void;
}

function roundLabel(points: 0 | 1 | 2): string {
  if (points === 2) return "Sintonia. Os dois se leram.";
  if (points === 1) return "Alguém leu, alguém não — a conversa é a rodada de verdade.";
  return "Desencontro total. Às vezes o mais engraçado.";
}

function otherPick(reveal: SintoniaReveal, me: SintoniaRevealPick): SintoniaRevealPick {
  return reveal.picks.find((p) => p.playerId !== me.playerId) ?? me;
}

export function SintoniaRevealScreen({
  reveal,
  tableCardIds,
  sharedScore,
  round,
  isHost,
  busy,
  onContinue,
}: SintoniaRevealScreenProps) {
  const blackText = blackCardText(reveal.blackCardId);

  return (
    <div className="screen">
      <p className="reveal__title">
        +{reveal.roundPoints} nesta rodada · {sharedScore}/{SINTONIA_MAX_SCORE}
      </p>
      <p className="muted">{roundLabel(reveal.roundPoints)}</p>

      <div className="sintonia-pairs">
        {reveal.picks.map((p) => {
          const other = otherPick(reveal, p);
          const minhaId = tableCardIds[p.minha];
          const suaId = tableCardIds[p.sua];
          if (minhaId === undefined || suaId === undefined) return null;

          // Palpite acerta se bate com a Minha da outra pessoa.
          const palpiteHit = p.sua === other.minha;

          return (
            <section key={p.playerId} className="sintonia-pair">
              <h3 className="sintonia-pair__title">Resultados por {p.playerName}</h3>
              <div className="sintonia-pair__row">
                <FilledBlackCard segments={fillBlackCardSegments(blackText, [whiteCardText(minhaId)])} />
                <FilledBlackCard
                  verdict={palpiteHit ? "hit" : "miss"}
                  segments={fillBlackCardSegments(blackText, [whiteCardText(suaId)])}
                />
              </div>
            </section>
          );
        })}
      </div>

      <p className="muted">Rodada {round} de 10</p>

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
