import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";

export function useMyHand(roomCode: string | null, playerId: string | null): number[] {
  const [hand, setHand] = useState<number[]>([]);

  useEffect(() => {
    if (!roomCode || !playerId) {
      setHand([]);
      return;
    }
    return onSnapshot(doc(db, "rooms", roomCode, "hands", playerId), (snap) => {
      setHand((snap.data()?.cardIds as number[]) ?? []);
    });
  }, [roomCode, playerId]);

  return hand;
}
