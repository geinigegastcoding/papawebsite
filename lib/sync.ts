import type { Profile, TrainingState, WorkoutLog } from './fitness';

export interface CheckInRecord {
  completedFor: number;
  completedAt: string;
  answers: Record<string, string>;
}

export interface FitnessSnapshot {
  profile: Profile | null;
  profileUpdatedAt: string | null;
  trainingState: TrainingState;
  checkIn: CheckInRecord | null;
}

function timestamp(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mergeTrainingStates(local: TrainingState, remote: TrainingState): TrainingState {
  const logsById = new Map<string, WorkoutLog>();
  for (const log of remote.logs) logsById.set(log.id, log);
  for (const log of local.logs) logsById.set(log.id, log);

  return {
    logs: [...logsById.values()].sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
    overrides: { ...remote.overrides, ...local.overrides },
    timeFactor: Math.max(local.timeFactor, remote.timeFactor)
  };
}

export function mergeCheckIns(local: CheckInRecord | null, remote: CheckInRecord | null): CheckInRecord | null {
  if (!local) return remote;
  if (!remote) return local;
  return timestamp(local.completedAt) >= timestamp(remote.completedAt) ? local : remote;
}

export function mergeFitnessSnapshots(local: FitnessSnapshot, remote: FitnessSnapshot): FitnessSnapshot {
  const localIsNewer = timestamp(local.profileUpdatedAt) >= timestamp(remote.profileUpdatedAt);

  return {
    profile: localIsNewer ? local.profile ?? remote.profile : remote.profile ?? local.profile,
    profileUpdatedAt: localIsNewer ? local.profileUpdatedAt ?? remote.profileUpdatedAt : remote.profileUpdatedAt ?? local.profileUpdatedAt,
    trainingState: mergeTrainingStates(local.trainingState, remote.trainingState),
    checkIn: mergeCheckIns(local.checkIn, remote.checkIn)
  };
}
