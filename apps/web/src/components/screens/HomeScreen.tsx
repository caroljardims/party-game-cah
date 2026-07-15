import { useState } from "react";

interface HomeScreenProps {
  busy: boolean;
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
}

export function HomeScreen({ busy, onCreate, onJoin }: HomeScreenProps) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="screen screen--home">
      <h1 className="brand">Cartas Contra a Humanidade</h1>
      <p className="brand__subtitle">Um party game para pessoas terríveis.</p>

      <div className="tabs">
        <button
          type="button"
          className={mode === "create" ? "tab tab--active" : "tab"}
          onClick={() => setMode("create")}
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
          if (mode === "create") onCreate(name.trim());
          else onJoin(code.trim(), name.trim());
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
        <label className="field">
          <span>Seu nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Como vamos te chamar?"
            required
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {mode === "create" ? "Criar sala" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
