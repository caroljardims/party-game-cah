import { useState } from "react";
import type { PlayerDoc, RoomDoc } from "../../types.js";

interface LobbyScreenProps {
  room: RoomDoc;
  players: PlayerDoc[];
  isHost: boolean;
  busy: boolean;
  onStart: (targetScore: number) => void;
}

export function LobbyScreen({ room, players, isHost, busy, onStart }: LobbyScreenProps) {
  const [targetScore, setTargetScore] = useState(7);
  const canStart = players.length >= 2;
  const modeHint =
    players.length === 2
      ? "Com 2 jogadores a partida será Modo Sintonia."
      : players.length >= 3
        ? "Com 3 ou mais jogadores a partida será o Clássico."
        : "É preciso pelo menos 2 jogadores para começar.";

  return (
    <div className="screen">
      <h2>Sala {room.code}</h2>
      <p className="muted">Compartilhe este código com o grupo.</p>

      <ul className="player-list">
        {players.map((p) => (
          <li key={p.id}>
            <span className="player-list__marker" aria-hidden>
              {p.marker || "🔥"}
            </span>
            {p.name}
            {p.isHost && <span className="tag">anfitrião</span>}
          </li>
        ))}
      </ul>

      <p className="muted">{modeHint}</p>
      <p className="muted">{players.length} jogador{players.length === 1 ? "" : "es"} na sala</p>

      {isHost ? (
        <div className="lobby-controls">
          {players.length >= 3 && (
            <label className="field">
              <span>Pontuação para vencer</span>
              <input
                type="number"
                min={3}
                max={30}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
              />
            </label>
          )}
          <button
            type="button"
            className="btn btn--primary"
            disabled={!canStart || busy}
            onClick={() => onStart(targetScore)}
          >
            Iniciar partida
          </button>
          {!canStart && <p className="muted">Aguardando mais gente…</p>}
        </div>
      ) : (
        <p className="muted">Aguardando o anfitrião iniciar a partida…</p>
      )}
    </div>
  );
}
