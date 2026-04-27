/**
 * NexusOps — useAuth hook
 *
 * Exposes the current Supabase session and user, a loading state,
 * and a signOut helper. Reads directly from Supabase — never from
 * localStorage. Subscribes to auth state changes so components
 * re-render when the session changes.
 *
 * @example
 * const { user, session, loading, signOut } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) return <Redirect to="/auth" />;
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

/**
 * useAuth
 *
 * Returns the current authentication state from Supabase.
 *
 * @returns {{ user, session, loading, signOut }}
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Resolve current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Keep state in sync with Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, []);

  return { user, session, loading, signOut };
}
