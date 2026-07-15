import { signInAnonymously, type Auth, type User } from "firebase/auth";

/** Cria uma sessão anônima do Firebase Auth se ainda não existir uma. */
export async function ensureGuestAuth(auth: Auth): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}
