/**
 * NexusOps — GaiaBubble
 *
 * Persistent floating assistant trigger, fixed at bottom-right on every page.
 * Shows a pulse animation when closed and an unread badge when there are
 * contextual tips for the current page. Clicking toggles GaiaPanel open/closed.
 */
import { useEffect } from "react";

export interface GaiaBubbleProps {
  /** Whether the Gaia panel is currently open. */
  isOpen: boolean;
  /** Toggle the panel open/closed. */
  onToggle: () => void;
  /** Show an unread indicator dot. */
  hasUnread?: boolean;
}

/**
 * Floating action button that opens/closes the GAIA AI assistant panel.
 * Fixed at bottom-right, always on top (z-index 200).
 */
export function GaiaBubble({ isOpen, onToggle, hasUnread = false }: GaiaBubbleProps): JSX.Element {
  // Inject pulse keyframes once
  useEffect(() => {
    const id = "gaia-bubble-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @keyframes gaia-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(14,164,114,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(14,164,114,0); }
        }
        .gaia-bubble-btn { animation: gaia-pulse 2.5s ease-in-out infinite; }
        .gaia-bubble-btn:hover { transform: scale(1.08); }
        .gaia-bubble-btn.open { animation: none; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 200,
      }}
    >
      <button
        onClick={onToggle}
        aria-label={isOpen ? "Close GAIA AI assistant" : "Open GAIA AI assistant"}
        className={`gaia-bubble-btn${isOpen ? " open" : ""}`}
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: isOpen ? "var(--color-bg-elevated)" : "var(--color-brand)",
          border: isOpen ? "2px solid var(--color-brand)" : "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "all 0.2s ease",
          boxShadow: isOpen ? "0 4px 20px rgba(14,164,114,0.3)" : "0 4px 16px rgba(14,164,114,0.4)",
        }}
      >
        {isOpen ? (
          /* X icon when open */
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          /* Sparkle icon when closed */
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M11 2L12.5 8.5L19 10L12.5 11.5L11 18L9.5 11.5L3 10L9.5 8.5L11 2Z"
              fill="white"
              stroke="white"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
            <circle cx="17" cy="5" r="1.5" fill="white" opacity="0.7" />
            <circle cx="4" cy="16" r="1" fill="white" opacity="0.5" />
          </svg>
        )}

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#3dffa0",
              border: "2px solid var(--color-bg-base)",
            }}
          />
        )}
      </button>
    </div>
  );
}
