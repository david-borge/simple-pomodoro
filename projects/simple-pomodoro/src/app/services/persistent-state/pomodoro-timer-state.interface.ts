export type PomodoroTimerStatus = 'running' | 'paused' | 'cancelled';

export interface PomodoroTimerState {
    status: PomodoroTimerStatus;
    totalDurationSeconds: number;
    remainingSeconds: number;
    endsAtMs: number | null;
}
