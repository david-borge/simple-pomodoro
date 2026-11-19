import { Service } from '@angular/core';

import { TIMER_CONFIG } from '../../config/timer.config';
import { ONE_MINUTE_IN_SECONDS } from '../../constants/time-conversion.constants';
import { TimerSessionText } from './timer-session-text.enum';
import type { TimerSession, TimerSessionsList } from './timer-session.interface';
import { TimerSessionType } from './timer-session.interface';

@Service()
export class TimerSessionsService {
    private static readonly FOCUS_SESSION_DURATION_IN_SEC = Math.round(
        TIMER_CONFIG.sessions.focusSessionDurationInMin * ONE_MINUTE_IN_SECONDS,
    );
    private static readonly SHORT_REST_SESSION_DURATION_IN_SEC = Math.round(
        TIMER_CONFIG.sessions.shortRestSessionDurationInMin * ONE_MINUTE_IN_SECONDS,
    );
    private static readonly LONG_REST_SESSION_DURATION_IN_SEC = Math.round(
        TIMER_CONFIG.sessions.longRestSessionDurationInMin * ONE_MINUTE_IN_SECONDS,
    );
    private static readonly LONG_REST_CADENCE = TIMER_CONFIG.sessions.longRestCadence;

    public getTimerSessionsFromTotalSeconds(totalSeconds: number): TimerSessionsList {
        if (totalSeconds <= 0) {
            throw new Error('totalSeconds must be a positive number.');
        }

        const timerSessions: TimerSessionsList = [];
        let remainingDurationInSec = totalSeconds;
        let completedFocusSessions = 0;

        while (remainingDurationInSec > 0) {
            const focusDurationInSec = Math.min(
                remainingDurationInSec,
                TimerSessionsService.FOCUS_SESSION_DURATION_IN_SEC,
            );

            timerSessions.push({
                durationInSec: focusDurationInSec,
                type: TimerSessionType.Focus,
            });
            remainingDurationInSec -= focusDurationInSec;

            if (focusDurationInSec < TimerSessionsService.FOCUS_SESSION_DURATION_IN_SEC) {
                break;
            }

            completedFocusSessions += 1;

            if (remainingDurationInSec === 0) {
                break;
            }

            const restDurationInSec =
                completedFocusSessions % TimerSessionsService.LONG_REST_CADENCE === 0
                    ? TimerSessionsService.LONG_REST_SESSION_DURATION_IN_SEC
                    : TimerSessionsService.SHORT_REST_SESSION_DURATION_IN_SEC;

            const actualRestDurationInSec = Math.min(remainingDurationInSec, restDurationInSec);

            timerSessions.push({
                durationInSec: actualRestDurationInSec,
                type:
                    restDurationInSec === TimerSessionsService.LONG_REST_SESSION_DURATION_IN_SEC
                        ? TimerSessionType.LongRest
                        : TimerSessionType.ShortRest,
            });
            remainingDurationInSec -= actualRestDurationInSec;
        }

        return timerSessions;
    }

    public getNumberOfSessionsOfAParticulaType(
        timerSessionsList: TimerSessionsList,
        sessionType: TimerSessionType,
    ) {
        return timerSessionsList.filter((timerSession) => timerSession.type === sessionType).length;
    }

    public getCurrentTimerSessionFromCurrentTotalSeconds(
        timerSessionList: TimerSessionsList,
        totalSeconds: number,
    ): TimerSession {
        if (totalSeconds <= 0) {
            throw new Error('totalSeconds must be a positive number.');
        }

        let remainingSeconds = totalSeconds;

        for (let index = timerSessionList.length - 1; index >= 0; index--) {
            const timerSession = timerSessionList[index];

            if (remainingSeconds <= timerSession.durationInSec) {
                return timerSession;
            }

            remainingSeconds -= timerSession.durationInSec;
        }

        throw new Error('totalSeconds exceeds the total duration of timerSessionList.');
    }

    public getCurrentTimerSessionRemainingSeconds(
        timerSessionList: TimerSessionsList,
        totalSeconds: number,
    ): number {
        if (totalSeconds <= 0) {
            throw new Error('totalSeconds must be a positive number.');
        }

        let remainingSeconds = totalSeconds;

        for (let index = timerSessionList.length - 1; index >= 0; index--) {
            const timerSession = timerSessionList[index];

            if (remainingSeconds <= timerSession.durationInSec) {
                return remainingSeconds;
            }

            remainingSeconds -= timerSession.durationInSec;
        }

        throw new Error('totalSeconds exceeds the total duration of timerSessionList.');
    }

    public getTimerSessionTypeText(timerSessionType: TimerSessionType | undefined): string {
        switch (timerSessionType) {
            case TimerSessionType.Focus:
                return TimerSessionText.Focus;

            case TimerSessionType.ShortRest:
            case TimerSessionType.LongRest:
                return TimerSessionText.Rest;

            default:
                return TimerSessionText.Focus;
        }
    }
}
