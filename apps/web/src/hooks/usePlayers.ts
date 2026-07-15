import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";
import type { PlayerDoc } from "../types.js";

export function usePlayers(roomCode: string | null): PlayerDoc[] {
  const [players, setPlayers] = useState<PlayerDoc[]>([]);

  useEffect(() => {
    if (!roomCode) {
      setPlayers([]);
      return;
    }
    return onSnapshot(collection(db, "rooms", roomCode, "players"), (snap) => {
      setPlayers(snap.docs.map((d) => d.data() as PlayerDoc));
    });
  }, [roomCode]);

  return players;
}
