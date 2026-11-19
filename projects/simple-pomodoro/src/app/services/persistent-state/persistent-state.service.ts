import { Service, inject } from '@angular/core';

import { ONE_SECOND_IN_MILIISECONDS } from '../../constants/time-conversion.constants';
import { CapacitorPreferencesService } from '../capacitor-preferences/capacitor-preferences.service';
import { TimerSessionType } from '../timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../timer-sessions/timer-sessions.service';
import type { PomodoroTimerState } from './pomodoro-timer-state.interface';

interface StoredPomodoroTimerState extends PomodoroTimerState {
    version: 1;
}

@Service()
export class PersistentStateService {
    private static readonly TIMER_STATE_KEY = 'simplePomodoro.timerState';
    private static readonly INITIAL_BACKGROUND_STATE_KEY = 'simplePomodoro.initialBackgroundState';

    private readonly capacitorPreferencesService = inject(CapacitorPreferencesService);
    private readonly timerSessionsService = inject(TimerSessionsService);

    public async loadPomodoroTimerState(): Promise<PomodoroTimerState | null> {
        const storedState = await this.capacitorPreferencesService.get<unknown>(
            PersistentStateService.TIMER_STATE_KEY,
        );

        if (storedState === null) {
            this.updateInitialBackgroundHint(null);
            return null;
        }

        const timerState = this.parsePomodoroTimerState(storedState);

        if (timerState === null) {
            this.updateInitialBackgroundHint(null);
            await this.capacitorPreferencesService.remove(PersistentStateService.TIMER_STATE_KEY);
            return null;
        }

        const restoredState = {
            ...timerState,
            remainingSeconds: this.getRestoredRemainingSeconds(timerState),
        };

        this.updateInitialBackgroundHint(restoredState);

        return restoredState;
    }

    public savePomodoroTimerState(timerState: PomodoroTimerState): Promise<void> {
        this.updateInitialBackgroundHint(timerState);

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

    private updateInitialBackgroundHint(state: PomodoroTimerState | null): void {
        const sessions =
            state === null
                ? []
                : this.timerSessionsService.getTimerSessionsFromTotalSeconds(
                      state.totalDurationSeconds,
                  );
        const remainingSeconds = state === null ? 0 : this.getRestoredRemainingSeconds(state);
        const initialBackgroundState =
            state === null ? null : { ...state, remainingSeconds, sessions };
        const isRestSession =
            state !== null &&
            state.status !== 'cancelled' &&
            remainingSeconds > 0 &&
            [TimerSessionType.ShortRest, TimerSessionType.LongRest].includes(
                this.timerSessionsService.getCurrentTimerSessionFromCurrentTotalSeconds(
                    sessions,
                    remainingSeconds,
                ).type,
            );

        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('starts-in-rest-session', isRestSession);
        }

        try {
            if (typeof localStorage === 'undefined') {
                return;
            }

            if (initialBackgroundState === null) {
                localStorage.removeItem(PersistentStateService.INITIAL_BACKGROUND_STATE_KEY);
                return;
            }

            localStorage.setItem(
                PersistentStateService.INITIAL_BACKGROUND_STATE_KEY,
                JSON.stringify(initialBackgroundState),
            );
        } catch {
            // The synchronous hint is only for the initial page color; Capacitor Preferences remains authoritative.
        }
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
