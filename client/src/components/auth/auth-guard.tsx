/**
 * NexusOps — AuthGuard
 *
 * Wrapper component that protects authenticated routes.
 * Reads supabase.auth.getSession() on mount and subscribes to
 * auth state changes. Redirects to /auth if no session exists.
 *
 * Usage: wrap any component that requires authentication.
 *
 * @example
 * <AuthGuard>
 *   <DashboardPage />
 * </AuthGuard>
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard
 *
 * Renders children only when a Supabase session is confirmed.
 * Shows a loading state while the session is being resolved.
 * Redirects to /auth on session absence or expiry.
 *
 * @param props.children - The protected content to render
 */
export function AuthGuard({ children }: AuthGuardProps): JSX.Element | null {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Subscribe to auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still resolving session — show loading spinner
  if (session === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg-base)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-brand)", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Loading workspace…
          </p>
        </div>
      </div>
    );
  }

  // No session — redirect to auth
  if (!session) {
    setLocation("/auth");
    return null;
  }

  return <>{children}</>;
}
