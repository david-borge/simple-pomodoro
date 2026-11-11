import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { INITIAL_TIMER_VALUE_IN_SEC } from '../../constants/initial-timer-value.const';
import { InjectionScopes } from '../../constants/injection-scopes.constant';
import { ONE_SECOND_IN_MILIISECONDS } from '../../constants/time-conversion.constants';

@Injectable({ providedIn: InjectionScopes.ROOT })
export class TimerService {
  private totalSeconds = INITIAL_TIMER_VALUE_IN_SEC;
  private totalSecondsBehaviorSubject = new BehaviorSubject<number>(this.totalSeconds);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _isTimerCancelled = true;
  private _isTimerPaused = false;

  public readonly totalSeconds$ = this.totalSecondsBehaviorSubject.asObservable();

  public startTimer() {
    if (this.intervalId) {
      return;
    }

    this._isTimerCancelled = false;
    this._isTimerPaused = false;
    this.intervalId = setInterval(() => {
      this.totalSeconds--;
      this.totalSecondsBehaviorSubject.next(this.totalSeconds);
    }, ONE_SECOND_IN_MILIISECONDS);
  }

  public pauseTimer() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this._isTimerPaused = true;
  }

  public cancelTimer() {
    this.pauseTimer();
    this.totalSeconds = INITIAL_TIMER_VALUE_IN_SEC;
    this._isTimerCancelled = true;
    this._isTimerPaused = false;
    this.totalSecondsBehaviorSubject.next(this.totalSeconds);
  }

  public get isTimerRunning(): boolean {
    return this.intervalId !== null;
  }

  public get isTimerPaused(): boolean {
    return this._isTimerPaused;
  }

  public get isTimerCancelled(): boolean {
    return this._isTimerCancelled;
  }
}
