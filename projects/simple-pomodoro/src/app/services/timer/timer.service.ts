import { inject, Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { TIMER_CONFIG } from '../../config/timer.config.production';
import { InjectionScopes } from '../../constants/injection-scopes.constant';
import {
    ONE_MINUTE_IN_SECONDS,
    ONE_SECOND_IN_MILIISECONDS,
} from '../../constants/time-conversion.constants';
import { TimerSession, TimerSessionsList } from '../timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../timer-sessions/timer-sessions.service';

@Injectable({ providedIn: InjectionScopes.ROOT })
export class TimerService {
    private readonly timerSessionsService = inject(TimerSessionsService);

    private intervalId: ReturnType<typeof setInterval> | null = null;

    private _isTimerRunning = false;
    private _isTimerPaused = false;
    private _isTimerCancelled = true;
    private _isTimerBeingEdited = false;

    private _totalSeconds = Math.round(
        TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS,
    );
    private timerSessionList: TimerSessionsList = [];
    private _editedTotalSeconds = this._totalSeconds;
    private _isCircleResetting = false;

    private timerStatusBehaviorSubject = new BehaviorSubject({
        isTimerRunning: this._isTimerRunning,
        isTimerPaused: this._isTimerPaused,
        isTimerCancelled: this._isTimerCancelled,
        isTimerBeingEdited: this._isTimerBeingEdited,
    });
    public readonly timerStatus$ = this.timerStatusBehaviorSubject.asObservable();

    private totalSecondsBehaviorSubject = new BehaviorSubject(this._totalSeconds);
    public readonly totalSeconds$ = this.totalSecondsBehaviorSubject.asObservable();

    private currentTimerSessionBehaviorSubject = new BehaviorSubject<TimerSession | null>(null);
    public readonly currentTimerSession$ = this.currentTimerSessionBehaviorSubject.asObservable();

    private circleResettingBehaviorSubject = new BehaviorSubject(this._isCircleResetting);
    public readonly isCircleResetting$ = this.circleResettingBehaviorSubject.asObservable();

    private emitTimerStatus() {
        this.timerStatusBehaviorSubject.next({
            isTimerRunning: this.isTimerRunning,
            isTimerPaused: this.isTimerPaused,
            isTimerCancelled: this._isTimerCancelled,
            isTimerBeingEdited: this.isTimerBeingEdited,
        });
    }

    public startTimer() {
        if (this.intervalId || this._isCircleResetting) {
            return;
        }

        this._isTimerPaused = false;
        this._isTimerCancelled = false;
        this._isTimerBeingEdited = false;

        this.timerSessionList = this.timerSessionsService.getTimerSessionsFromTotalSeconds(
            this._editedTotalSeconds,
        );
        this.emitCurrentTimerSession();

        this.intervalId = setInterval(() => {
            this._totalSeconds--;
            this.totalSecondsBehaviorSubject.next(this._totalSeconds);
            this.emitCurrentTimerSession();
        }, ONE_SECOND_IN_MILIISECONDS);
        this.emitTimerStatus();
    }

    public pauseTimer() {
        if (!this.intervalId) {
            return;
        }

        clearInterval(this.intervalId);
        this.intervalId = null;
        this._isTimerPaused = true;
        this.emitTimerStatus();
    }

    public cancelTimer() {
        this.pauseTimer();
        this._isCircleResetting = true;
        this.circleResettingBehaviorSubject.next(this._isCircleResetting);
        this._totalSeconds = this._editedTotalSeconds;
        this._isTimerPaused = false;
        this._isTimerCancelled = true;
        this.totalSecondsBehaviorSubject.next(this._totalSeconds);
        this.currentTimerSessionBehaviorSubject.next(null);
        this.emitTimerStatus();
    }

    public completeCircleReset() {
        if (!this._isCircleResetting) {
            return;
        }

        this._isCircleResetting = false;
        this.circleResettingBehaviorSubject.next(this._isCircleResetting);
    }

    public starEditingTimer() {
        this._isTimerBeingEdited = true;
        this.emitTimerStatus();
    }

    public stopEditingTimer() {
        this._isTimerBeingEdited = false;
        this.emitTimerStatus();
    }

    public editTimer(totalSeconds: typeof this._totalSeconds) {
        this._totalSeconds = totalSeconds;
        this.totalSecondsBehaviorSubject.next(this._totalSeconds);

        this._editedTotalSeconds = totalSeconds;
    }

    private emitCurrentTimerSession() {
        if (this._totalSeconds <= 0) {
            return;
        }

        const currentTimerSession =
            this.timerSessionsService.getCurrentTimerSessionFromCurrentTotalSeconds(
                this.timerSessionList,
                this._totalSeconds,
            );

        if (currentTimerSession !== this.currentTimerSessionBehaviorSubject.value) {
            this.currentTimerSessionBehaviorSubject.next(currentTimerSession);
        }
    }

    public get isTimerRunning(): boolean {
        return this.intervalId !== null;
    }

    public get isTimerPaused(): typeof this._isTimerPaused {
        return this._isTimerPaused;
    }

    public get isTimerCancelled(): typeof this._isTimerCancelled {
        return this._isTimerCancelled;
    }

    public get isTimerBeingEdited(): typeof this._isTimerBeingEdited {
        return this._isTimerBeingEdited;
    }

    public get isCircleResetting(): typeof this._isCircleResetting {
        return this._isCircleResetting;
    }

    public get editedTotalSeconds(): typeof this._editedTotalSeconds {
        return this._editedTotalSeconds;
    }

    public get currentTimerSessionRemainingSeconds(): number {
        if (this._totalSeconds <= 0) {
            return 0;
        }

        if (this.currentTimerSessionBehaviorSubject.value === null) {
            return this._totalSeconds;
        }

        return this.timerSessionsService.getCurrentTimerSessionRemainingSeconds(
            this.timerSessionList,
            this._totalSeconds,
        );
    }
}
