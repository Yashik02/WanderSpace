import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured, supabase, authEmail } from "../lib/supabase";
import { User } from "../types";
import { useNotifications } from "./useNotifications";
import { useLanguage } from "./useLanguage";
interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotifications();
    const { t } = useLanguage();
    useEffect(() => {
        if (!isSupabaseConfigured) {
            console.warn(
                "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.",
            );
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        let mounted = true;
        if (!isSupabaseConfigured) return;
        const restoreUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (mounted) {
                setUser(
                    data.user
                        ? {
                              id: data.user.id,
                              username:
                                  data.user.user_metadata.username ??
                                  data.user.email ??
                                  data.user.id,
                          }
                        : null,
                );
                setLoading(false);
            }
        };
        restoreUser().catch((error) => {
            console.error("Failed to restore Supabase user:", error);
            if (mounted) setLoading(false);
        });
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(
                session?.user
                    ? {
                          id: session.user.id,
                          username:
                              session.user.user_metadata.username ??
                              session.user.email ??
                              session.user.id,
                      }
                    : null,
            );
            setLoading(false);
        });
        return () => {
            mounted = false;
            data.subscription.unsubscribe();
        };
    }, []);
    const login = async (username: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: authEmail(username),
            password,
        });
        if (error) {
            notify(error.message || t("authFailed"), "error");
            throw error;
        }
        notify(t("loggedIn"), "success");
    };
    const register = async (username: string, password: string) => {
        const normalizedUsername = username.trim();
        const { error } = await supabase.auth.signUp({
            email: authEmail(normalizedUsername),
            password,
            options: { data: { username: normalizedUsername } },
        });
        if (error) {
            notify(error.message || t("authFailed"), "error");
            throw error;
        }
        notify(t("register"), "success");
    };
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            notify(error.message || "Logout failed.", "error");
            return;
        }
        setUser(null);
        notify(t("loggedOut"), "success");
    };
    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used within AuthProvider");
    return value;
};
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !user) navigate("/auth?mode=login", { replace: true });
    }, [loading, user, navigate]);
    return loading || !user ? null : <>{children}</>;
};
