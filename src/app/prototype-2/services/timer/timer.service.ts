import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { TIMER_CONFIG } from '../../config/timer.config';
import { InjectionScopes } from '../../constants/injection-scopes.constant';
import { ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MILIISECONDS } from '../../constants/time-conversion.constants';

@Injectable({ providedIn: InjectionScopes.ROOT })
export class TimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private _isTimerRunning = false;
  private _isTimerPaused = false;
  private _isTimerCancelled = true;
  private _isTimerBeingEdited = false;

  private timerStatusBehaviorSubject = new BehaviorSubject({
    isTimerRunning: this._isTimerRunning,
    isTimerPaused: this._isTimerPaused,
    isTimerCancelled: this._isTimerCancelled,
    isTimerBeingEdited: this._isTimerBeingEdited,
  });
  public readonly timerStatus$ = this.timerStatusBehaviorSubject.asObservable();

  private _totalSeconds = TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS;
  private totalSecondsBehaviorSubject = new BehaviorSubject(this._totalSeconds);
  public readonly totalSeconds$ = this.totalSecondsBehaviorSubject.asObservable();

  private _editedTotalSeconds = this._totalSeconds;

  private emitTimerStatus() {
    this.timerStatusBehaviorSubject.next({
      isTimerRunning: this.isTimerRunning,
      isTimerPaused: this.isTimerPaused,
      isTimerCancelled: this._isTimerCancelled,
      isTimerBeingEdited: this.isTimerBeingEdited,
    });
  }

  public startTimer() {
    if (this.intervalId) {
      return;
    }

    this._isTimerPaused = false;
    this._isTimerCancelled = false;
    this._isTimerBeingEdited = false;

    this.intervalId = setInterval(() => {
      this._totalSeconds--;
      this.totalSecondsBehaviorSubject.next(this._totalSeconds);
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
    this._totalSeconds = this._editedTotalSeconds;
    this._isTimerPaused = false;
    this._isTimerCancelled = true;
    this.totalSecondsBehaviorSubject.next(this._totalSeconds);
    this.emitTimerStatus();
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

  public get editedTotalSeconds(): typeof this._editedTotalSeconds {
    return this._editedTotalSeconds;
  }
}
