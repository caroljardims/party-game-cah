import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";
import type { RoomDoc } from "../types.js";

interface RoomState {
  room: RoomDoc | null;
  error: FirestoreError | null;
}

export function useRoomDoc(roomCode: string | null): RoomState {
  const [state, setState] = useState<RoomState>({ room: null, error: null });

  useEffect(() => {
    if (!roomCode) {
      setState({ room: null, error: null });
      return;
    }
    return onSnapshot(
      doc(db, "rooms", roomCode),
      (snap) => setState({ room: snap.exists() ? (snap.data() as RoomDoc) : null, error: null }),
      (error) => setState({ room: null, error }),
    );
  }, [roomCode]);

  return state;
}
