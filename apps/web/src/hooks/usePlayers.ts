import { collection, doc, getDocFromServer, onSnapshot, type FirestoreError } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";
import type { PlayerDoc } from "../types.js";

interface PlayersState {
  players: PlayerDoc[];
  error: FirestoreError | null;
}

export function usePlayers(roomCode: string | null): PlayersState {
  const [state, setState] = useState<PlayersState>({ players: [], error: null });

  useEffect(() => {
    if (!roomCode) {
      setState({ players: [], error: null });
      return;
    }
    return onSnapshot(
      collection(db, "rooms", roomCode, "players"),
      (snap) =>
        setState({
          players: snap.docs.map((d) => ({ ...(d.data() as PlayerDoc), id: d.id })),
          error: null,
        }),
      (error) => setState({ players: [], error }),
    );
  }, [roomCode]);

  return state;
}

/** Força leitura fresca da sala no servidor (útil após startGame no Safari). */
export async function refreshRoomFromServer(roomCode: string): Promise<void> {
  await getDocFromServer(doc(db, "rooms", roomCode));
}
