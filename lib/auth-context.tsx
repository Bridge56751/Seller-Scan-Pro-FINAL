import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getApiUrl } from "./query-client";
import { fetch } from "expo/fetch";
import { getDeviceId } from "./device-id";

const SESSION_KEY = "session_token";

interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  isGuest: boolean;
  isPaid: boolean;
  scanCount: number;
  freeScansLeft: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (appleUserId: string, email?: string, fullName?: string, identityToken?: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  recordScan: () => Promise<{ allowed: boolean; freeScansLeft: number }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    return null;
  }
}

async function setStoredToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_KEY, token);
  } catch {}
}

async function removeStoredToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const token = await getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const baseUrl = getApiUrl();
      const url = new URL("/api/auth/me", baseUrl);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        await removeStoredToken();
      }
    } catch {
      await removeStoredToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(appleUserId: string, email?: string, fullName?: string, identityToken?: string) {
    const baseUrl = getApiUrl();
    const url = new URL("/api/auth/apple", baseUrl);
    const deviceId = await getDeviceId();

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appleUserId, email, fullName, identityToken, deviceId }),
    });

    if (!res.ok) {
      throw new Error("Sign in failed");
    }

    const data = await res.json();
    await setStoredToken(data.sessionToken);
    setUser(data.user);
  }

  async function signInAsGuest() {
    const baseUrl = getApiUrl();
    const url = new URL("/api/auth/guest", baseUrl);
    const deviceId = await getDeviceId();

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });

    if (!res.ok) {
      throw new Error("Guest sign in failed");
    }

    const data = await res.json();
    await setStoredToken(data.sessionToken);
    setUser(data.user);
  }

  async function signOut() {
    try {
      const token = await getStoredToken();
      if (token) {
        const baseUrl = getApiUrl();
        const url = new URL("/api/auth/logout", baseUrl);
        await fetch(url.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {} finally {
      await removeStoredToken();
      setUser(null);
    }
  }

  async function deleteAccount() {
    try {
      const token = await getStoredToken();
      if (token) {
        const baseUrl = getApiUrl();
        const url = new URL("/api/auth/delete-account", baseUrl);
        await fetch(url.toString(), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {} finally {
      await removeStoredToken();
      setUser(null);
    }
  }

  const recordScan = useCallback(async (): Promise<{ allowed: boolean; freeScansLeft: number }> => {
    const token = await getStoredToken();
    if (!token) return { allowed: false, freeScansLeft: 0 };

    const baseUrl = getApiUrl();
    const url = new URL("/api/auth/record-scan", baseUrl);
    const deviceId = await getDeviceId();

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });

    if (!res.ok) return { allowed: false, freeScansLeft: 0 };

    const data = await res.json();

    setUser((prev) =>
      prev
        ? { ...prev, scanCount: data.scanCount, freeScansLeft: data.freeScansLeft, isPaid: data.isPaid }
        : prev,
    );

    return { allowed: data.allowed, freeScansLeft: data.freeScansLeft };
  }, []);

  const refreshUser = useCallback(async () => {
    await checkSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signInAsGuest,
      signOut,
      deleteAccount,
      recordScan,
      refreshUser,
    }),
    [user, isLoading, recordScan, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
