declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string> }
    ) => void;
  }
}

/**
 * Track a custom event via Plausible Analytics.
 * No-ops gracefully if Plausible isn't loaded (e.g. ad-blockers, SSR).
 */
export function trackEvent(
  event: string,
  props?: Record<string, string>
): void {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}
