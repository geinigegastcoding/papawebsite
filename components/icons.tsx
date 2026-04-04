type IconProps = {
  className?: string;
};

export function AnalysisIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="7" y="8" width="34" height="30" rx="10" stroke="currentColor" strokeWidth="2.5" />
      <path d="M15 29L22 22L28 26L34 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="29" r="2.5" fill="currentColor" />
      <circle cx="22" cy="22" r="2.5" fill="currentColor" />
      <circle cx="28" cy="26" r="2.5" fill="currentColor" />
      <circle cx="34" cy="18" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="7" y="8" width="34" height="30" rx="10" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 30V23" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 30V18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 30V13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function StrategyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M10 11H38L30 21L38 31H10V11Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 37V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
