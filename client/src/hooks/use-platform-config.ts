/**
 * NexusOps — usePlatformConfig
 *
 * Fetches platform configuration values from Airtable.
 * Returns a key→value map for easy lookup throughout the app.
 * Optionally filter by category (e.g., "gaia", "ui", "limits").
 *
 * @returns {{ config, loading, error }}
 */
import { useState, useEffect } from "react";
import { fetchPlatformConfig } from "@/lib/airtable";

export interface UsePlatformConfigReturn {
  config: Record<string, string>;
  loading: boolean;
  error: string | null;
}

export function usePlatformConfig(category?: string): UsePlatformConfigReturn {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPlatformConfig(category)
      .then((items) => {
        if (!cancelled) {
          const map: Record<string, string> = {};
          items.forEach((item) => { map[item.key] = item.value; });
          setConfig(map);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load platform config");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [category]);

  return { config, loading, error };
}
