import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ensureGuestAuth } from "../auth/ensureGuestAuth.js";
import { auth } from "../firebase.js";

interface AuthState {
  user: User | null;
  error: string | null;
}

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ user: auth.currentUser, error: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setState({ user: u, error: null }));
    ensureGuestAuth(auth).catch((err) => {
      setState({
        user: null,
        error: err instanceof Error ? err.message : "Não foi possível iniciar sua sessão.",
      });
    });
    return unsub;
  }, []);

  return state;
}
