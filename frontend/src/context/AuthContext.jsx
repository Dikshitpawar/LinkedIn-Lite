import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { authApi, setAuthToken } from "../api";
import { parseDurationMs } from "../utils/duration";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // kept in memory only, never localStorage
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const refreshTimerRef = useRef(null);
  const scheduleRefresh = useCallback((expiresAtStr) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const ms = parseDurationMs(expiresAtStr);
    const delay = Math.max(ms - 60_000, ms / 2);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const r = await authApi.refresh();
        const token = r.data.accessToken.token;
        setAuthToken(token);
        setAccessToken(token);
        scheduleRefresh(r.data.accessToken.expiresAt);
      } catch {
        setAuthToken(null);
        setAccessToken(null);
        setUser(null);
      }
    }, delay);
  }, []);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    authApi
      .refresh()
      .then((r) => {
        const token = r.data.accessToken.token;
        setAuthToken(token);
        setAccessToken(token);
        scheduleRefresh(r.data.accessToken.expiresAt);
        return authApi.getMe();
      })
      .then((r) => setUser(r.data.user))
      .catch(() => {
        setAuthToken(null);
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback(
    async (email, password) => {
      const r = await authApi.login(email, password);
      const token = r.data.accessToken.token;
      setAuthToken(token);
      setAccessToken(token);
      setUser(r.data.user);
      scheduleRefresh(r.data.accessToken.expiresAt);
      return r.data.user;
    },
    [scheduleRefresh],
  );

  const register = useCallback(
    async (name, email, password) => {
      await authApi.register(name, email, password);
      return login(email, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    try {
      await authApi.logout();
    } catch (_) {}
    setAuthToken(null);
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    const r = await authApi.getMe();
    setUser(r.data.user);
    return r.data.user;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
