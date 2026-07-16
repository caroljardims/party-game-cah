import { useState } from "react";
import { whiteCardText } from "cah-game-engine";
import { Card } from "../Card.js";

interface SintoniaPickScreenProps {
  blackText: string;
  tableCardIds: number[];
  myMarker: string;
  otherMarker: string;
  otherName: string;
  busy: boolean;
  onSubmit: (minha: number, sua: number) => void;
}

type Step = "minha" | "sua";

export function SintoniaPickScreen({
  blackText,
  tableCardIds,
  myMarker,
  otherMarker,
  otherName,
  busy,
  onSubmit,
}: SintoniaPickScreenProps) {
  const [step, setStep] = useState<Step>("minha");
  const [minha, setMinha] = useState<number | null>(null);
  const [sua, setSua] = useState<number | null>(null);

  function selectIndex(index: number) {
    if (step === "minha") {
      setMinha(index);
      setStep("sua");
      return;
    }
    setSua(index);
  }

  const canSend = minha !== null && sua !== null;

  return (
    <div className="screen">
      <p className="muted">Rodada de sintonia</p>
      <Card kind="black" text={blackText} pick={1} />

      <p className="sintonia-prompt">
        {step === "minha" ? (
          <>
            <strong>{myMarker} Sua escolha</strong> — a carta que você acha mais engraçada. Honestamente.
          </>
        ) : (
          <>
            <strong>
              {otherMarker} Palpite sobre {otherName}
            </strong>{" "}
            — a carta que você acha que {otherName} escolheu.
          </>
        )}
      </p>

      {(minha !== null || sua !== null) && (
        <p className="muted sintonia-picks-summary">
          {minha !== null && <span>{myMarker} escolha marcada</span>}
          {sua !== null && (
            <span>
              {" "}
              · {otherMarker} palpite marcado
            </span>
          )}
          {minha !== null && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setStep("minha");
                setSua(null);
              }}
            >
              refazer
            </button>
          )}
        </p>
      )}

      <div className="hand-grid">
        {tableCardIds.map((cardId, index) => {
          const isMinha = index === minha;
          const isSua = index === sua;
          const selected = isMinha || isSua;
          return (
            <div key={`${cardId}-${index}`} className="hand-slot">
              <Card
                kind="white"
                text={whiteCardText(cardId)}
                selected={selected}
                disabled={busy}
                onClick={() => selectIndex(index)}
              />
              {(isMinha || isSua) && (
                <span className="sintonia-card-marks" aria-hidden>
                  {isMinha && <span>{myMarker}</span>}
                  {isSua && <span>{otherMarker}</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn--primary btn--sticky"
        disabled={!canSend || busy}
        onClick={() => {
          if (minha === null || sua === null) return;
          onSubmit(minha, sua);
        }}
      >
        Enviar escolha
      </button>
    </div>
  );
}
