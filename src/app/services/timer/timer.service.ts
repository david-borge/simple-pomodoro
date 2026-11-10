import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { InjectionScopes } from '../../constants/injection-scopes.constant';
import { ONE_SECOND_IN_MILIISECONDS } from '../../constants/time-conversion.constants';

@Injectable({ providedIn: InjectionScopes.ROOT })
export class TimerService {
  private totalSeconds = 0;
  private totalSecondsBehaviorSubject = new BehaviorSubject<number>(this.totalSeconds);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  public readonly totalSeconds$ = this.totalSecondsBehaviorSubject.asObservable();

  public startTimer() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.totalSeconds++;
      this.totalSecondsBehaviorSubject.next(this.totalSeconds);
    }, ONE_SECOND_IN_MILIISECONDS);
  }

  public pauseTimer() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  public isTimerRunning(): boolean {
    return this.intervalId !== null;
  }
}
