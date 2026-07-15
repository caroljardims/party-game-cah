import { useEffect, useMemo, useState } from "react";
import { blackCardText } from "cah-game-engine";
import { EndScreen } from "./components/screens/EndScreen.js";
import { HomeScreen } from "./components/screens/HomeScreen.js";
import { JudgeScreen } from "./components/screens/JudgeScreen.js";
import { LobbyScreen } from "./components/screens/LobbyScreen.js";
import { RevealScreen } from "./components/screens/RevealScreen.js";
import { SubmitScreen } from "./components/screens/SubmitScreen.js";
import { WaitingScreen } from "./components/screens/WaitingScreen.js";
import { useAuthUser } from "./hooks/useAuthUser.js";
import { useMyHand } from "./hooks/useMyHand.js";
import { usePlayers } from "./hooks/usePlayers.js";
import { useRoomDoc } from "./hooks/useRoomDoc.js";
import * as actions from "./lib/actions.js";
import { clearSession, loadSession, saveSession } from "./lib/session.js";
import type { Session } from "./types.js";

export default function App() {
  const { user, error: authError } = useAuthUser();
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealDismissedRound, setRevealDismissedRound] = useState(0);

  const room = useRoomDoc(session?.roomCode ?? null);
  const players = usePlayers(session?.roomCode ?? null);
  const hand = useMyHand(session?.roomCode ?? null, session?.playerId ?? null);

  const me = useMemo(() => players.find((p) => p.id === session?.playerId), [players, session]);

  // Sala não existe mais (ex: reiniciada em outro dispositivo) — volta pro início.
  useEffect(() => {
    if (session && room === null && players.length === 0) {
      const t = setTimeout(() => {
        clearSession();
        setSession(null);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [session, room, players.length]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setBusy(false);
    }
  }

  function handleCreate(name: string) {
    void run(async () => {
      const { roomCode, playerId } = await actions.createRoom(name);
      const next = { roomCode, playerId };
      saveSession(next);
      setSession(next);
    });
  }

  function handleJoin(code: string, name: string) {
    void run(async () => {
      const { roomCode, playerId } = await actions.joinRoom(code, name);
      const next = { roomCode, playerId };
      saveSession(next);
      setSession(next);
    });
  }

  function handleLeave() {
    clearSession();
    setSession(null);
    setError(null);
  }

  if (authError) {
    return (
      <main className="app">
        <div className="screen screen--center">
          <p className="banner banner--error">Não foi possível conectar: {authError}</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <div className="screen screen--center">
        <div className="spinner" aria-hidden />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="app">
        {error && <div className="banner banner--error">{error}</div>}
        <HomeScreen busy={busy} onCreate={handleCreate} onJoin={handleJoin} />
        <Footer />
      </main>
    );
  }

  if (!room || !me) {
    return (
      <main className="app">
        <div className="screen screen--center">
          <div className="spinner" aria-hidden />
          <p className="muted">Carregando sala…</p>
        </div>
      </main>
    );
  }

  const isHost = me.isHost;
  const isCzar = room.czarPlayerId === me.id;
  const iSubmitted = room.submittedPlayerIds.includes(me.id);

  const showReveal =
    room.status === "submitting" && room.lastWinner !== null && revealDismissedRound !== room.round;

  return (
    <main className="app">
      <header className="app-header">
        <span className="app-header__code">{room.code}</span>
        <button type="button" className="link-btn" onClick={handleLeave}>
          Sair
        </button>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      {showReveal && room.lastWinner ? (
        <RevealScreen winner={room.lastWinner} onContinue={() => setRevealDismissedRound(room.round)} />
      ) : (
        <Screen
          room={room}
          players={players}
          hand={hand}
          isHost={isHost}
          isCzar={isCzar}
          iSubmitted={iSubmitted}
          myPlayerId={me.id}
          busy={busy}
          run={run}
        />
      )}
    </main>
  );
}

function Screen(props: {
  room: NonNullable<ReturnType<typeof useRoomDoc>>;
  players: ReturnType<typeof usePlayers>;
  hand: number[];
  isHost: boolean;
  isCzar: boolean;
  iSubmitted: boolean;
  myPlayerId: string;
  busy: boolean;
  run: (fn: () => Promise<void>) => Promise<void>;
}) {
  const { room, players, hand, isHost, isCzar, iSubmitted, myPlayerId, busy, run } = props;

  if (room.status === "lobby") {
    return (
      <LobbyScreen
        room={room}
        players={players}
        isHost={isHost}
        busy={busy}
        onStart={(targetScore) => void run(() => actions.startGame(room.code, targetScore))}
      />
    );
  }

  if (room.status === "submitting") {
    if (isCzar) {
      return (
        <WaitingScreen
          message="Você é o Card Czar nesta rodada."
          progress={`${room.submittedPlayerIds.length}/${players.length - 1} já responderam`}
        />
      );
    }
    if (iSubmitted) {
      return (
        <WaitingScreen
          message="Resposta enviada!"
          progress={`${room.submittedPlayerIds.length}/${players.length - 1} já responderam`}
        />
      );
    }
    return (
      <SubmitScreen
        blackText={blackCardText(room.blackCardId!)}
        pick={room.blackCardPick ?? 1}
        hand={hand}
        busy={busy}
        onSubmit={(cardIds) => void run(() => actions.submitCards(room.code, myPlayerId, cardIds))}
      />
    );
  }

  if (room.status === "judging") {
    if (isCzar) {
      return (
        <JudgeScreen
          blackText={blackCardText(room.blackCardId!)}
          pick={room.blackCardPick ?? 1}
          slots={room.judgingSlots ?? []}
          busy={busy}
          onPick={(slotId) => void run(() => actions.czarPick(room.code, myPlayerId, slotId))}
        />
      );
    }
    return <WaitingScreen message="O Card Czar está escolhendo a resposta mais engraçada…" />;
  }

  return (
    <EndScreen
      players={players}
      winnerPlayerId={room.winnerPlayerId}
      isHost={isHost}
      busy={busy}
      onRestart={() => void run(() => actions.restartGame(room.code))}
    />
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>
        Baseado em <em>Cards Against Humanity</em>, disponibilizado sob{" "}
        <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/" target="_blank" rel="noreferrer">
          CC BY-NC-SA 2.0
        </a>
        .
      </p>
    </footer>
  );
}
