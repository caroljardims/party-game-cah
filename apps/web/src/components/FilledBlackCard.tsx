import type { BlackCardSegment } from "../lib/cardText.js";

interface FilledBlackCardProps {
  segments: BlackCardSegment[];
  /** Acerto/erro do palpite (Sintonia), ao lado da frase. */
  verdict?: "hit" | "miss";
}

/** Carta preta com a(s) resposta(s) já encaixada(s), destacadas em amarelo. */
export function FilledBlackCard({ segments, verdict }: FilledBlackCardProps) {
  return (
    <div className="card card--black">
      <span className="card__text card__text--with-verdict">
        <span className="card__sentence">
          {segments.map((segment, i) =>
            segment.isAnswer ? (
              <span key={i} className="card__answer">
                {segment.text}
              </span>
            ) : (
              <span key={i}>{segment.text}</span>
            ),
          )}
        </span>
        {verdict === "hit" && (
          <span className="card__verdict" title="Acertou" aria-label="Acertou">
            🎯
          </span>
        )}
        {verdict === "miss" && (
          <span className="card__verdict" title="Errou" aria-label="Errou">
            ❌
          </span>
        )}
      </span>
    </div>
  );
}
