import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";
import type { RoomDoc } from "../types.js";

export function useRoomDoc(roomCode: string | null): RoomDoc | null {
  const [room, setRoom] = useState<RoomDoc | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      return;
    }
    return onSnapshot(doc(db, "rooms", roomCode), (snap) => {
      setRoom(snap.exists() ? (snap.data() as RoomDoc) : null);
    });
  }, [roomCode]);

  return room;
}
