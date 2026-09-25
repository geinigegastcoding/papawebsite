import type { AnalyticsEvent } from './analytics-policy';

// ponytail: personal portal stays local and does not need a telemetry vendor.
export function trackAnalyticsEvent(_event: AnalyticsEvent): void {}
