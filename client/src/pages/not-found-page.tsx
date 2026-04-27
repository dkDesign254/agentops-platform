/**
 * NexusOps — 404 Not Found page
 *
 * Shown when no route matches. Provides navigation back to home.
 */
import { useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";

export default function NotFoundPage(): JSX.Element {
  const [, setLocation] = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-6)", textAlign: "center" }}>
      <Logo size="sm" />
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-brand)", letterSpacing: "0.1em", marginTop: "var(--space-8)", marginBottom: "var(--space-3)" }}>
        404
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
        Page not found
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)", maxWidth: 360 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button onClick={() => setLocation("/")}
        style={{ background: "var(--color-brand)", border: "none", borderRadius: "var(--radius-md)", padding: "0.7rem 1.5rem", fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-inverse)", cursor: "pointer", fontFamily: "var(--font-display)" }}>
        Back to home
      </button>
    </div>
  );
}
