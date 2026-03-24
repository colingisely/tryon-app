// lib/plan-features.ts
// Single source of truth for per-plan feature flags.
// Update this file whenever plan capabilities change.

export interface PlanFeatures {
  /** Access to Studio Pro (tryon-max, premium credits) */
  studioPro: boolean;
  /** Access to collected lead emails in the dashboard */
  leads: boolean;
  /** Access to advanced analytics page (funnel, top products, size data) */
  analyticsAdvanced: boolean;
  /** Remove "Powered by Reflexy" badge from the widget */
  removeBadge: boolean;
  /** Priority support */
  prioritySupport: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    studioPro:         false,
    leads:             false,
    analyticsAdvanced: false,
    removeBadge:       false,
    prioritySupport:   false,
  },
  starter: {
    studioPro:         true,
    leads:             true,
    analyticsAdvanced: false,
    removeBadge:       false,
    prioritySupport:   false,
  },
  growth: {
    studioPro:         true,
    leads:             true,
    analyticsAdvanced: true,
    removeBadge:       false,
    prioritySupport:   false,
  },
  pro: {
    studioPro:         true,
    leads:             true,
    analyticsAdvanced: true,
    removeBadge:       false,
    prioritySupport:   true,
  },
  enterprise: {
    studioPro:         true,
    leads:             true,
    analyticsAdvanced: true,
    removeBadge:       true,
    prioritySupport:   true,
  },
};

/** Returns feature flags for the given plan slug. Defaults to 'free' if unknown. */
export function getPlanFeatures(planSlug: string | null | undefined): PlanFeatures {
  return PLAN_FEATURES[planSlug ?? 'free'] ?? PLAN_FEATURES.free;
}
