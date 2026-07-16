import { SINTONIA_MAX_SCORE } from "cah-game-engine";
import type { PlayerDoc } from "../../types.js";

interface SintoniaEndScreenProps {
  sharedScore: number;
  players: PlayerDoc[];
  isHost: boolean;
  busy: boolean;
  onRestart: () => void;
}

export function SintoniaEndScreen({
  sharedScore,
  players,
  isHost,
  busy,
  onRestart,
}: SintoniaEndScreenProps) {
  return (
    <div className="screen screen--center">
      <p className="reveal__title">
        Vocês fizeram {sharedScore}/{SINTONIA_MAX_SCORE} de sintonia
      </p>
      <p className="muted">Não existe vitória — existe uma nota. Guardem. Joguem de novo em um mês e comparem.</p>
      <ul className="sintonia-end-players">
        {players.map((p) => (
          <li key={p.id}>
            {p.marker || "🔥"} {p.name}
          </li>
        ))}
      </ul>
      {isHost ? (
        <button type="button" className="btn btn--primary" disabled={busy} onClick={onRestart}>
          Jogar de novo
        </button>
      ) : (
        <p className="muted">Aguardando o anfitrião reiniciar…</p>
      )}
    </div>
  );
}
