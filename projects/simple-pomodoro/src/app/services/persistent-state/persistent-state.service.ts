import { Service, inject } from '@angular/core';

import { ONE_SECOND_IN_MILIISECONDS } from '../../constants/time-conversion.constants';
import { CapacitorPreferencesService } from '../capacitor-preferences/capacitor-preferences.service';
import { PomodoroTimerState } from './pomodoro-timer-state.interface';

interface StoredPomodoroTimerState extends PomodoroTimerState {
    version: 1;
}

@Service()
export class PersistentStateService {
    private static readonly TIMER_STATE_KEY = 'simplePomodoro.timerState';

    private readonly capacitorPreferencesService = inject(CapacitorPreferencesService);

    public async loadPomodoroTimerState(): Promise<PomodoroTimerState | null> {
        const storedState = await this.capacitorPreferencesService.get<unknown>(
            PersistentStateService.TIMER_STATE_KEY,
        );

        if (storedState === null) {
            return null;
        }

        const timerState = this.parsePomodoroTimerState(storedState);

        if (timerState === null) {
            await this.capacitorPreferencesService.remove(PersistentStateService.TIMER_STATE_KEY);
            return null;
        }

        return {
            ...timerState,
            remainingSeconds: this.getRestoredRemainingSeconds(timerState),
        };
    }

    public savePomodoroTimerState(timerState: PomodoroTimerState): Promise<void> {
        const storedState: StoredPomodoroTimerState = {
            version: 1,
            ...timerState,
        };

        return this.capacitorPreferencesService.set(
            PersistentStateService.TIMER_STATE_KEY,
            storedState,
        );
    }

    private getRestoredRemainingSeconds(state: PomodoroTimerState): number {
        if (state.status === 'running' && state.endsAtMs !== null) {
            return Math.max(
                0,
                Math.ceil((state.endsAtMs - Date.now()) / ONE_SECOND_IN_MILIISECONDS),
            );
        }

        if (state.status === 'cancelled') {
            return state.totalDurationSeconds;
        }

        return state.remainingSeconds;
    }

    private parsePomodoroTimerState(value: unknown): PomodoroTimerState | null {
        if (value === null || typeof value !== 'object') {
            return null;
        }

        const state = value as Partial<StoredPomodoroTimerState>;

        if (
            state.version !== 1 ||
            (state.status !== 'running' &&
                state.status !== 'paused' &&
                state.status !== 'cancelled') ||
            !Number.isFinite(state.totalDurationSeconds) ||
            state.totalDurationSeconds === undefined ||
            state.totalDurationSeconds <= 0 ||
            !Number.isFinite(state.remainingSeconds) ||
            state.remainingSeconds === undefined ||
            state.remainingSeconds < 0
        ) {
            return null;
        }

        if (
            state.status === 'running' &&
            (!Number.isFinite(state.endsAtMs) ||
                state.endsAtMs === null ||
                state.endsAtMs === undefined)
        ) {
            return null;
        }

        return {
            status: state.status,
            totalDurationSeconds: state.totalDurationSeconds,
            remainingSeconds: state.remainingSeconds,
            endsAtMs: state.status === 'running' ? state.endsAtMs! : null,
        };
    }
}
