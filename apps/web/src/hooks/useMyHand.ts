import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";

interface HandState {
  hand: number[];
  error: FirestoreError | null;
}

export function useMyHand(roomCode: string | null, playerId: string | null): HandState {
  const [state, setState] = useState<HandState>({ hand: [], error: null });

  useEffect(() => {
    if (!roomCode || !playerId) {
      setState({ hand: [], error: null });
      return;
    }
    return onSnapshot(
      doc(db, "rooms", roomCode, "hands", playerId),
      (snap) => setState({ hand: (snap.data()?.cardIds as number[]) ?? [], error: null }),
      (error) => setState({ hand: [], error }),
    );
  }, [roomCode, playerId]);

  return state;
}
