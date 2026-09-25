export const ANALYTICS_EVENTS = {
  onboardingStarted: 'onboarding_started',
  onboardingCompleted: 'onboarding_completed',
  workoutStarted: 'workout_started',
  workoutCompleted: 'workout_completed',
  feedbackCompleted: 'feedback_completed',
  syncCompleted: 'sync_completed',
  analyticsConsentGranted: 'analytics_consent_granted'
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
