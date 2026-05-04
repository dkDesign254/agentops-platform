/**
 * NexusOps — useTourContent
 *
 * Fetches tour steps and contextual help content for a given page
 * from the Airtable Tour and Help Content table.
 * Results sorted by Tour Step Order ascending.
 *
 * @param page - Page identifier e.g. "dashboard", "workflows", "audit"
 * @param type - Optional filter: "tour_step" | "tooltip" | "gaia_context"
 * @returns {{ steps, loading, error }}
 */
import { useState, useEffect } from "react";
import { fetchTourContent, type TourStep, type TourContentType } from "@/lib/airtable";

export interface UseTourContentReturn {
  steps: TourStep[];
  loading: boolean;
  error: string | null;
}

export function useTourContent(page: string, type?: TourContentType): UseTourContentReturn {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!page) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTourContent(page, type)
      .then((data) => {
        if (!cancelled) setSteps(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load tour content");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, type]);

  return { steps, loading, error };
}
