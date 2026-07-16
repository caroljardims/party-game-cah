import { initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  type FirestoreSettings,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";

const useEmu = import.meta.env.VITE_USE_EMULATORS === "1";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "localhost",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "party-game-cah",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(cfg);
export const auth = getAuth(app);

// Long-polling em todos os browsers: o transporte Fetch Streams do Firestore
// falha/atrasa updates no Safari/WebKit (anfitrião fica preso no lobby após start).
const firestoreSettings = {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
} as FirestoreSettings;

export const db = initializeFirestore(app, firestoreSettings);
export const fn = getFunctions(app, import.meta.env.VITE_FUNCTIONS_REGION ?? "us-central1");

if (useEmu) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(fn, "127.0.0.1", 5001);
}

export const call = <T, R>(name: string) => httpsCallable<T, R>(fn, name);

/** Extrai a mensagem útil de erros do Firebase Callable. */
export function callableErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "Algo deu errado.";
  const e = err as { message?: string; code?: string; details?: unknown };
  const raw = typeof e.message === "string" ? e.message : "";
  const cleaned = raw
    .replace(/^Firebase:\s*/i, "")
    .replace(/\s*\(functions\/[^)]+\)\.?\s*$/i, "")
    .trim();
  if (cleaned && cleaned.toLowerCase() !== "internal") return cleaned;
  if (typeof e.details === "string" && e.details.trim()) return e.details.trim();
  if (e.code) return e.code.replace(/^functions\//, "");
  return cleaned || "Algo deu errado.";
}
