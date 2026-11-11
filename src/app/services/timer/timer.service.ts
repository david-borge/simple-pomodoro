import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { INITIAL_TIMER_VALUE_IN_SEC } from '../../constants/initial-timer-value.const';
import { InjectionScopes } from '../../constants/injection-scopes.constant';
import { ONE_SECOND_IN_MILIISECONDS } from '../../constants/time-conversion.constants';

@Injectable({ providedIn: InjectionScopes.ROOT })
export class TimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _isTimerCancelled = true;
  private _isTimerPaused = false;

  private _totalSeconds = INITIAL_TIMER_VALUE_IN_SEC;
  private totalSecondsBehaviorSubject = new BehaviorSubject(this._totalSeconds);
  public readonly totalSeconds$ = this.totalSecondsBehaviorSubject.asObservable();

  private _isTimerBeingEdited = false;
  private isTimerBeingEditedBehaviorSubject = new BehaviorSubject(this._isTimerBeingEdited);
  public readonly isTimerBeingEdited$ = this.isTimerBeingEditedBehaviorSubject.asObservable();

  private editedTotalSeconds = this._totalSeconds;

  public startTimer() {
    if (this.intervalId) {
      return;
    }

    this._isTimerCancelled = false;
    this._isTimerPaused = false;

    this._isTimerBeingEdited = false;
    this.isTimerBeingEditedBehaviorSubject.next(this._isTimerBeingEdited);

    this.intervalId = setInterval(() => {
      this._totalSeconds--;
      this.totalSecondsBehaviorSubject.next(this._totalSeconds);
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
    this._totalSeconds = this.editedTotalSeconds;
    this._isTimerCancelled = true;
    this._isTimerPaused = false;
    this.totalSecondsBehaviorSubject.next(this._totalSeconds);
  }

  public starEditingTimer() {
    this._isTimerBeingEdited = true;
    this.isTimerBeingEditedBehaviorSubject.next(this._isTimerBeingEdited);
  }

  public stopEditingTimer() {
    this._isTimerBeingEdited = false;
    this.isTimerBeingEditedBehaviorSubject.next(this._isTimerBeingEdited);
  }

  public editTimer(totalSeconds: typeof this._totalSeconds) {
    this._totalSeconds = totalSeconds;
    this.totalSecondsBehaviorSubject.next(this._totalSeconds);

    this.editedTotalSeconds = totalSeconds;
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
}
