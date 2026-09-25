export interface CompletedWorkout {
  workoutId: string;
  completedAt: string;
}

export interface WeeklyStreak {
  current: number;
  best: number;
  completedThisWeek: number;
  requiredThisWeek: number;
}

interface StreakInput {
  plannedPerWeek: number;
  completed: CompletedWorkout[];
  now?: Date;
}

function localWeekStart(value: Date): Date {
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function weekKey(value: Date): string {
  const start = localWeekStart(value);
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  return `${start.getFullYear()}-${month}-${day}`;
}

function weekDistance(from: string, to: string): number {
  const fromDate = new Date(`${from}T12:00:00`);
  const toDate = new Date(`${to}T12:00:00`);
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
}

export function calculateWeeklyStreak({ plannedPerWeek, completed, now = new Date() }: StreakInput): WeeklyStreak {
  const planned = Math.max(0, Math.floor(plannedPerWeek));
  const requiredThisWeek = Math.ceil(planned * 0.8);
  const currentWeek = weekKey(now);
  const weeks = new Map<string, Set<string>>();

  for (const item of completed) {
    if (!item || typeof item.workoutId !== 'string' || !item.workoutId) continue;
    const date = new Date(item.completedAt);
    if (!Number.isFinite(date.getTime())) continue;
    const key = weekKey(date);
    const ids = weeks.get(key) ?? new Set<string>();
    ids.add(item.workoutId);
    weeks.set(key, ids);
  }

  const completedThisWeek = weeks.get(currentWeek)?.size ?? 0;
  const qualified = [...weeks.entries()]
    .filter(([, ids]) => requiredThisWeek > 0 && ids.size >= requiredThisWeek)
    .map(([key]) => key)
    .sort();
  const qualifiedSet = new Set(qualified);

  let current = 0;
  let cursor = currentWeek;
  if (!qualifiedSet.has(currentWeek)) {
    const previous = qualified.filter((key) => weekDistance(key, currentWeek) > 0).at(-1);
    cursor = previous ?? currentWeek;
  }
  if (qualifiedSet.has(cursor)) {
    current = 1;
    let index = qualified.indexOf(cursor) - 1;
    while (index >= 0 && weekDistance(qualified[index], cursor) === 7) {
      current += 1;
      cursor = qualified[index];
      index -= 1;
    }
  }

  let best = 0;
  let run = 0;
  for (let index = 0; index < qualified.length; index += 1) {
    run = index > 0 && weekDistance(qualified[index - 1], qualified[index]) === 7 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  return { current, best, completedThisWeek, requiredThisWeek };
}
