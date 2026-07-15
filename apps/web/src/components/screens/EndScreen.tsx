import type { PlayerDoc } from "../../types.js";

interface EndScreenProps {
  players: PlayerDoc[];
  winnerPlayerId: string | null;
  isHost: boolean;
  busy: boolean;
  onRestart: () => void;
}

export function EndScreen({ players, winnerPlayerId, isHost, busy, onRestart }: EndScreenProps) {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const winner = players.find((p) => p.id === winnerPlayerId);

  return (
    <div className="screen screen--center">
      <p className="reveal__title">{winner ? `${winner.name} venceu a partida!` : "Fim de jogo!"}</p>
      <ol className="score-list">
        {ranked.map((p) => (
          <li key={p.id} className={p.id === winnerPlayerId ? "score-list__winner" : ""}>
            <span>{p.name}</span>
            <span>{p.score}</span>
          </li>
        ))}
      </ol>
      {isHost ? (
        <button type="button" className="btn btn--primary" disabled={busy} onClick={onRestart}>
          Jogar de novo
        </button>
      ) : (
        <p className="muted">Aguardando o anfitrião reiniciar a partida…</p>
      )}
    </div>
  );
}
