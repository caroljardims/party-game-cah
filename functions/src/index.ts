import { setGlobalOptions } from "firebase-functions/v2";
import "./lib/db.js";

setGlobalOptions({ region: "us-central1", maxInstances: 10, invoker: "public" });

export { createRoom, joinRoom } from "./handlers/room.js";
export { startGame, submitCards, sintoniaSubmitPicks, czarPick, continueRound, restartGame } from "./handlers/game.js";
