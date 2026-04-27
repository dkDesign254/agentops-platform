/**
 * NexusOps — AuthPage
 *
 * Full-page authentication screen supporting sign-in, sign-up, magic link,
 * Google OAuth, and forgot-password flows. All auth calls go through
 * supabase.auth.* — no custom auth logic.
 *
 * Route: /auth
 * Query param: ?mode=signup to open the registration form by default.
 * On success: redirects to /dashboard.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";

export interface AuthPageProps {
  /** Initial mode — driven by ?mode=signup query param */
  defaultMode?: "signin" | "signup";
}

type Mode = "signin" | "signup" | "magic" | "forgot";

/** Returns the ?mode= query param value from the current URL */
function getInitialMode(): Mode {
  if (typeof window === "undefined") return "signin";
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  return mode === "signup" ? "signup" : "signin";
}

/**
 * AuthPage
 *
 * Renders sign-in / sign-up / magic link / forgot-password forms.
 * Delegates all auth to Supabase. On success, navigates to /dashboard.
 *
 * @example
 * <Route path="/auth" component={AuthPage} />
 */
export default function AuthPage({ defaultMode }: AuthPageProps): JSX.Element {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>(defaultMode ?? getInitialMode());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setLocation("/dashboard");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm.");
      } else if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Magic link sent — check your inbox.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("signin");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth(): Promise<void> {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(message);
      setLoading(false);
    }
  }

  const isSignIn = mode === "signin";
  const isSignUp = mode === "signup";
  const isMagic = mode === "magic";
  const isForgot = mode === "forgot";

  return (
    <div
      style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}
      className="flex items-center justify-center px-4"
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(14,164,114,0.12), transparent)",
        }}
      />

      <div
        className="relative w-full max-w-md"
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-10)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }}>
            <Logo size="md" />
          </a>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
            }}
          >
            {isSignIn && "Welcome back"}
            {isSignUp && "Create your account"}
            {isMagic && "Sign in with a link"}
            {isForgot && "Reset your password"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            {isSignIn && "Sign in to your NexusOps workspace"}
            {isSignUp && "Start governing AI workflows for free"}
            {isMagic && "We'll email you a one-click sign-in link"}
            {isForgot && "Enter your email to receive a reset link"}
          </p>
        </div>

        {/* Google OAuth */}
        {(isSignIn || isSignUp) && (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4"
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                color: "var(--color-text-primary)",
              }}
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center mb-4">
              <div style={{ flex: 1, height: "1px", background: "var(--color-border-subtle)" }} />
              <span
                className="mx-3 text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                or
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--color-border-subtle)" }} />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Full name
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Email address
            </label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          {(isSignIn || isSignUp) && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Create a password" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border-default)",
                    color: "var(--color-text-primary)",
                    paddingRight: "2.5rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignIn && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs mt-1.5 hover:underline"
                  style={{ color: "var(--color-brand)" }}
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={loading}
            style={{
              background: "var(--color-brand)",
              color: "var(--color-text-inverse)",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {isSignIn && "Sign in"}
            {isSignUp && "Create account"}
            {isMagic && (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send magic link
              </>
            )}
            {isForgot && "Send reset link"}
          </Button>
        </form>

        {/* Mode switchers */}
        <div className="mt-6 text-center space-y-2">
          {(isSignIn || isSignUp) && (
            <button
              type="button"
              onClick={() => setMode(isMagic ? "signin" : "magic")}
              className="block w-full text-xs hover:underline"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sign in with a magic link instead
            </button>
          )}
          {isMagic && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="block w-full text-xs hover:underline"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Back to password sign-in
            </button>
          )}
          {isForgot && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="block w-full text-xs hover:underline"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Back to sign-in
            </button>
          )}
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {isSignIn ? (
              <>
                No account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="hover:underline"
                  style={{ color: "var(--color-brand)" }}
                >
                  Sign up free
                </button>
              </>
            ) : isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="hover:underline"
                  style={{ color: "var(--color-brand)" }}
                >
                  Sign in
                </button>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
