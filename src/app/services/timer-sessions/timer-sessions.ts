import { Service } from '@angular/core';

import type { TimerSessionsList } from './timer-session.interface';
import { TimerSessionType } from './timer-session.interface';

@Service()
export class TimerSessions {
  private static readonly FOCUS_DURATION_IN_MS = 25 * 60 * 1000;
  private static readonly SHORT_REST_DURATION_IN_MS = 5 * 60 * 1000;
  private static readonly LONG_REST_DURATION_IN_MS = 20 * 60 * 1000;
  private static readonly LONG_REST_CADENCE = 4;

  public getTimerSessionsFromTotalSeconds(totalSeconds: number): TimerSessionsList {
    if (!Number.isInteger(totalSeconds) || totalSeconds <= 0) {
      throw new Error('totalSeconds must be a positive integer');
    }

    const timerSessions: TimerSessionsList = [];
    let remainingDurationInMs = totalSeconds * 1000;
    let completedFocusSessions = 0;

    while (remainingDurationInMs > 0) {
      if (remainingDurationInMs < TimerSessions.FOCUS_DURATION_IN_MS) {
        throw new Error('totalSeconds does not map to complete Pomodoro sessions');
      }

      timerSessions.push({
        durationInMs: TimerSessions.FOCUS_DURATION_IN_MS,
        type: TimerSessionType.Focus,
      });
      remainingDurationInMs -= TimerSessions.FOCUS_DURATION_IN_MS;
      completedFocusSessions += 1;

      if (remainingDurationInMs === 0) {
        break;
      }

      const restDurationInMs =
        completedFocusSessions % TimerSessions.LONG_REST_CADENCE === 0
          ? TimerSessions.LONG_REST_DURATION_IN_MS
          : TimerSessions.SHORT_REST_DURATION_IN_MS;

      if (remainingDurationInMs < restDurationInMs) {
        throw new Error('totalSeconds does not map to complete Pomodoro sessions');
      }

      timerSessions.push({
        durationInMs: restDurationInMs,
        type:
          restDurationInMs === TimerSessions.LONG_REST_DURATION_IN_MS
            ? TimerSessionType.LongRest
            : TimerSessionType.ShortRest,
      });
      remainingDurationInMs -= restDurationInMs;
    }

    return timerSessions;
  }
}
