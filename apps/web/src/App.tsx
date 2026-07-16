import { useEffect, useMemo, useState } from "react";
import { blackCardText } from "cah-game-engine";
import { Scoreboard } from "./components/Scoreboard.js";
import { EndScreen } from "./components/screens/EndScreen.js";
import { HomeScreen } from "./components/screens/HomeScreen.js";
import { JudgeScreen } from "./components/screens/JudgeScreen.js";
import { LobbyScreen } from "./components/screens/LobbyScreen.js";
import { RevealScreen } from "./components/screens/RevealScreen.js";
import { SintoniaEndScreen } from "./components/screens/SintoniaEndScreen.js";
import { SintoniaPickScreen } from "./components/screens/SintoniaPickScreen.js";
import { SintoniaRevealScreen } from "./components/screens/SintoniaRevealScreen.js";
import { SubmitScreen } from "./components/screens/SubmitScreen.js";
import { WaitingScreen } from "./components/screens/WaitingScreen.js";
import { useAuthUser } from "./hooks/useAuthUser.js";
import { useMyHand } from "./hooks/useMyHand.js";
import { usePlayers } from "./hooks/usePlayers.js";
import { useRoomDoc } from "./hooks/useRoomDoc.js";
import * as actions from "./lib/actions.js";
import { callableErrorMessage } from "./firebase.js";
import { clearSession, loadSession, saveSession } from "./lib/session.js";
import { refreshRoomFromServer } from "./hooks/usePlayers.js";
import type { PlayerDoc, RoomDoc, Session } from "./types.js";

export default function App() {
  const { user, error: authError } = useAuthUser();
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomCode = user && session ? session.roomCode : null;

  const { room, error: roomError } = useRoomDoc(roomCode);
  const { players, error: playersError } = usePlayers(roomCode);

  // Mão só existe no Clássico. Sintonia usa mesa compartilhada — não assinar hands.
  const playerId =
    user && session && room && room.status !== "lobby" && room.mode !== "sintonia"
      ? session.playerId
      : null;
  const { hand, error: handError } = useMyHand(roomCode, playerId);

  const me = useMemo(() => players.find((p) => p.id === session?.playerId), [players, session]);

  useEffect(() => {
    if (session && room === null && players.length === 0 && !roomError && !playersError) {
      const t = setTimeout(() => {
        clearSession();
        setSession(null);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [session, room, players.length, roomError, playersError]);

  useEffect(() => {
    if (handError?.code === "permission-denied" && room?.mode !== "sintonia") {
      clearSession();
      setSession(null);
      setError("Sua sessão nesta sala expirou. Entre na sala de novo.");
    }
  }, [handError, room?.mode]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(callableErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleCreate(name: string, marker: string) {
    void run(async () => {
      const { roomCode, playerId } = await actions.createRoom(name, marker);
      const next = { roomCode, playerId };
      saveSession(next);
      setSession(next);
    });
  }

  function handleJoin(code: string, name: string, marker: string) {
    void run(async () => {
      const { roomCode, playerId } = await actions.joinRoom(code, name, marker);
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

  if (roomError || playersError) {
    return (
      <main className="app">
        <div className="screen screen--center">
          <p className="banner banner--error">
            Não foi possível carregar a sala: {(roomError ?? playersError)?.message}
          </p>
          <button type="button" className="link-btn" onClick={handleLeave}>
            Voltar ao início
          </button>
        </div>
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

  const isHost = Boolean(user && room.hostUid === user.uid);
  const isCzar = room.czarPlayerId === me.id;
  const iSubmitted = room.submittedPlayerIds.includes(me.id);

  const showReveal =
    room.mode !== "sintonia" && room.status === "submitting" && room.lastWinner !== null;

  return (
    <main className="app">
      <header className="app-header">
        <span className="app-header__code">{room.code}</span>
        <span className="app-header__player">
          Jogando como {me.marker || ""} {me.name}
        </span>
        <button type="button" className="link-btn" onClick={handleLeave}>
          Sair
        </button>
      </header>

      {room.status !== "lobby" && (
        <Scoreboard
          players={players}
          czarPlayerId={room.czarPlayerId}
          targetScore={room.targetScore}
          mode={room.mode}
          sharedScore={room.sharedScore ?? 0}
          round={room.round}
        />
      )}

      {error && <div className="banner banner--error">{error}</div>}

      {showReveal && room.lastWinner ? (
        <RevealScreen
          winner={room.lastWinner}
          isHost={isHost}
          busy={busy}
          onContinue={() => void run(() => actions.continueRound(room.code))}
        />
      ) : (
        <Screen
          room={room}
          players={players}
          hand={hand}
          isHost={isHost}
          isCzar={isCzar}
          iSubmitted={iSubmitted}
          myPlayerId={me.id}
          myMarker={me.marker || "🔥"}
          busy={busy}
          run={run}
        />
      )}
    </main>
  );
}

function Screen(props: {
  room: RoomDoc;
  players: PlayerDoc[];
  hand: number[];
  isHost: boolean;
  isCzar: boolean;
  iSubmitted: boolean;
  myPlayerId: string;
  myMarker: string;
  busy: boolean;
  run: (fn: () => Promise<void>) => Promise<void>;
}) {
  const { room, players, hand, isHost, isCzar, iSubmitted, myPlayerId, myMarker, busy, run } = props;

  if (room.status === "lobby") {
    return (
      <LobbyScreen
        room={room}
        players={players}
        isHost={isHost}
        busy={busy}
        onStart={(targetScore) =>
          void run(async () => {
            await actions.startGame(room.code, targetScore);
            await refreshRoomFromServer(room.code);
          })
        }
      />
    );
  }

  if (room.mode === "sintonia") {
    if (room.status === "submitting") {
      if (iSubmitted) {
        return (
          <WaitingScreen
            message="Escolha enviada!"
            progress={`${room.submittedPlayerIds.length}/2 já escolheram`}
          />
        );
      }
      return (
        <SintoniaPickScreen
          blackText={blackCardText(room.blackCardId!)}
          tableCardIds={room.tableCardIds ?? []}
          myMarker={myMarker}
          otherMarker={players.find((p) => p.id !== myPlayerId)?.marker || "💎"}
          otherName={players.find((p) => p.id !== myPlayerId)?.name || "a outra pessoa"}
          busy={busy}
          onSubmit={(minha, sua) =>
            void run(() => actions.sintoniaSubmitPicks(room.code, myPlayerId, minha, sua))
          }
        />
      );
    }

    if (room.status === "judging" && room.sintoniaReveal) {
      return (
        <SintoniaRevealScreen
          reveal={room.sintoniaReveal}
          tableCardIds={room.tableCardIds ?? []}
          sharedScore={room.sharedScore ?? 0}
          round={room.round}
          isHost={isHost}
          busy={busy}
          onContinue={() => void run(() => actions.continueRound(room.code))}
        />
      );
    }

    return (
      <SintoniaEndScreen
        sharedScore={room.sharedScore ?? 0}
        players={players}
        isHost={isHost}
        busy={busy}
        onRestart={() => void run(() => actions.restartGame(room.code))}
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
    return (
      <JudgeScreen
        blackText={blackCardText(room.blackCardId!)}
        slots={room.judgingSlots ?? []}
        busy={busy}
        isCzar={isCzar}
        onPick={isCzar ? (slotId) => void run(() => actions.czarPick(room.code, myPlayerId, slotId)) : undefined}
      />
    );
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
    <footer className="site-footer">
      Gostou?{" "}
      <a href="https://caroljardims.com.br/pix/">Me pague um café via Pix</a>
      {" "}
      ou{" "}
      <a href="https://buymeacoffee.com/caroljardims" target="_blank" rel="noopener noreferrer">
        Buy Me a Coffee
      </a>{" "}
      ☕
      <p className="site-footer__legal">
        Baseado em <em>Cards Against Humanity</em>, disponibilizado sob{" "}
        <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/" target="_blank" rel="noreferrer">
          CC BY-NC-SA 2.0
        </a>
        .
      </p>
    </footer>
  );
}
