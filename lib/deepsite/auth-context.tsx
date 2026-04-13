"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchMe, setStoredToken, getStoredToken } from "./api-client";
import { DEEPSITE_SKIP_AUTH } from "./env";
import type { UserMe } from "./types";

type AuthCtx = {
  token: string | null;
  user: UserMe | null;
  loading: boolean;
  setToken: (t: string | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function DeepSiteAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    setStoredToken(t);
    setTokenState(t);
    if (!t) setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (DEEPSITE_SKIP_AUTH) {
      setUser(null);
      setLoading(false);
      return;
    }
    const t = getStoredToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    setTokenState(t);
    try {
      const me = await fetchMe(t);
      setUser(me);
    } catch {
      setUser(null);
      setStoredToken(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    setStoredToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider
      value={{
        token,
        user,
        loading,
        setToken,
        refreshUser,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDeepSiteAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDeepSiteAuth must be used under DeepSiteAuthProvider");
  return v;
}
