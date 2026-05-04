/**
 * NexusOps — useIntegrations
 *
 * Fetches the Integration Registry from Airtable.
 * Optionally filters by status ("Live" | "Beta" | "Coming Soon").
 * Results are cached for the component lifetime — no polling.
 *
 * @returns {{ integrations, loading, error }}
 */
import { useState, useEffect } from "react";
import { fetchIntegrations, type Integration } from "@/lib/airtable";

export interface UseIntegrationsReturn {
  integrations: Integration[];
  loading: boolean;
  error: string | null;
}

export function useIntegrations(status?: string): UseIntegrationsReturn {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchIntegrations(status)
      .then((data) => {
        if (!cancelled) setIntegrations(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load integrations");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [status]);

  return { integrations, loading, error };
}
