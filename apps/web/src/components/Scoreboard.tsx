import { SINTONIA_MAX_SCORE } from "cah-game-engine";
import type { GameMode, PlayerDoc } from "../types.js";

interface ScoreboardProps {
  players: PlayerDoc[];
  czarPlayerId: string | null;
  targetScore: number;
  mode: GameMode | null;
  sharedScore: number;
  round: number;
}

export function Scoreboard({
  players,
  czarPlayerId,
  targetScore,
  mode,
  sharedScore,
  round,
}: ScoreboardProps) {
  if (mode === "sintonia") {
    return (
      <div className="scoreboard" aria-label="Placar de sintonia">
        <div className="scoreboard__shared">
          <span className="scoreboard__shared-score">
            {sharedScore}/{SINTONIA_MAX_SCORE}
          </span>
          <span className="muted">Rodada {round}/10</span>
        </div>
        <ul className="scoreboard__list">
          {players.map((p) => (
            <li key={p.id} className="scoreboard__item">
              <span aria-hidden>{p.marker || "🔥"}</span>
              <span className="scoreboard__name">{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const ranked = [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return (
    <div className="scoreboard" aria-label="Placar">
      <ul className="scoreboard__list">
        {ranked.map((p) => (
          <li
            key={p.id}
            className={p.id === czarPlayerId ? "scoreboard__item scoreboard__item--czar" : "scoreboard__item"}
          >
            <span className="scoreboard__name">{p.name}</span>
            {p.id === czarPlayerId && <span className="tag">czar</span>}
            <span className="scoreboard__score">{p.score}</span>
          </li>
        ))}
      </ul>
      <p className="scoreboard__meta muted">Meta: {targetScore}</p>
    </div>
  );
}
