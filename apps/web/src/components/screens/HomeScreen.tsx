import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { pickRandomMarkers } from "cah-game-engine";
import { db } from "../../firebase.js";

interface HomeScreenProps {
  busy: boolean;
  onCreate: (name: string, marker: string) => void;
  onJoin: (code: string, name: string, marker: string) => void;
}

export function HomeScreen({ busy, onCreate, onJoin }: HomeScreenProps) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [takenMarkers, setTakenMarkers] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>(() => pickRandomMarkers(8));
  const [marker, setMarker] = useState<string | null>(null);
  const selected = marker && !takenMarkers.includes(marker) ? marker : (options[0] ?? "🔥");
  const takenKey = [...takenMarkers].sort().join(",");

  // Quem entra vê emojis já usados na sala e recebe uma lista sorteada sem eles.
  useEffect(() => {
    if (mode !== "join" || code.length !== 4) {
      setTakenMarkers([]);
      return;
    }
    return onSnapshot(
      collection(db, "rooms", code, "players"),
      (snap) => {
        const taken = snap.docs
          .map((d) => String(d.data().marker ?? ""))
          .filter((m) => m.length > 0);
        setTakenMarkers(taken);
      },
      () => setTakenMarkers([]),
    );
  }, [mode, code]);

  useEffect(() => {
    const exclude = takenKey ? takenKey.split(",") : [];
    const next = pickRandomMarkers(8, exclude);
    setOptions(next);
    setMarker((current) => {
      if (current && next.includes(current) && !exclude.includes(current)) return current;
      return next[0] ?? null;
    });
  }, [takenKey, mode]);

  function reshuffleMarkers() {
    const next = pickRandomMarkers(8, takenMarkers);
    setOptions(next);
    setMarker(next[0] ?? null);
  }

  return (
    <div className="screen screen--home">
      <h1 className="brand">Cartas Contra a Humanidade</h1>
      <p className="brand__subtitle">Um party game para pessoas terríveis.</p>

      <div className="tabs">
        <button
          type="button"
          className={mode === "create" ? "tab tab--active" : "tab"}
          onClick={() => {
            setMode("create");
            setTakenMarkers([]);
          }}
        >
          Criar sala
        </button>
        <button
          type="button"
          className={mode === "join" ? "tab tab--active" : "tab"}
          onClick={() => setMode("join")}
        >
          Entrar em sala
        </button>
      </div>

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          if (mode === "create") onCreate(name.trim(), selected);
          else onJoin(code.trim(), name.trim(), selected);
        }}
      >
        {mode === "join" && (
          <label className="field">
            <span>Código da sala</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={4}
              placeholder="ABCD"
              autoCapitalize="characters"
              required
            />
          </label>
        )}

        <div className="field name-with-marker">
          <span>Seu nome e emoji</span>
          <div className="name-with-marker__row">
            <span className="name-with-marker__preview" aria-hidden>
              {selected}
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Como vamos te chamar?"
              required
            />
          </div>
          <p className="muted marker-picker__hint">
            {mode === "join" && takenMarkers.length > 0
              ? "Emojis já usados na sala ficam de fora da sua lista."
              : "Escolha um emoji — ele marca suas escolhas na mesa."}
          </p>
          <div className="marker-picker__grid" role="radiogroup" aria-label="Escolha um emoji">
            {options.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={selected === m}
                className={
                  selected === m ? "marker-picker__btn marker-picker__btn--active" : "marker-picker__btn"
                }
                onClick={() => setMarker(m)}
              >
                {m}
              </button>
            ))}
          </div>
          {options.length === 0 ? (
            <p className="muted">Não há emojis livres nesta sala.</p>
          ) : (
            <button type="button" className="link-btn marker-picker__reshuffle" onClick={reshuffleMarkers}>
              Outros emojis
            </button>
          )}
        </div>

        <button type="submit" className="btn btn--primary" disabled={busy || options.length === 0}>
          {mode === "create" ? "Criar sala" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
