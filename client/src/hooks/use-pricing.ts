/**
 * NexusOps — usePricing
 *
 * Fetches pricing plans from Airtable (via the client-side Airtable lib).
 * Plans are sorted by Sort Order ascending. Results are cached for the
 * lifetime of the component — no polling.
 *
 * @returns {{ plans, loading, error }}
 */
import { useState, useEffect } from "react";
import { fetchPricingPlans, type PricingPlan } from "@/lib/airtable";

export interface UsePricingReturn {
  plans: PricingPlan[];
  loading: boolean;
  error: string | null;
}

export function usePricing(): UsePricingReturn {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPricingPlans()
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load pricing plans");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { plans, loading, error };
}
