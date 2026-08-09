import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as logoutRequest, type User } from "@/lib/api";

const TOKEN_KEY = "fitapp_token";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!stored) return;
      try {
        const fetchedUser = await getMe(stored);
        setToken(stored);
        setUser(fetchedUser);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    }
    restoreSession().finally(() => setIsLoading(false));
  }, []);

  function setSession(newToken: string, newUser: User) {
    SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // best-effort server-side revocation; still clear the local session below
      }
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
