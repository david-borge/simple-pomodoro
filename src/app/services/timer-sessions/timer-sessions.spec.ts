import { TestBed } from '@angular/core/testing';

import { TimerSessionType } from './timer-session.interface';
import { TimerSessions } from './timer-sessions';

describe('TimerSessions', () => {
  let service: TimerSessions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerSessions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build the expected sessions for listed pomodoro totals', () => {
    const testCases = [
      {
        totalMinutes: 25,
        expectedTypes: [TimerSessionType.Focus],
      },
      {
        totalMinutes: 55,
        expectedTypes: [TimerSessionType.Focus, TimerSessionType.ShortRest, TimerSessionType.Focus],
      },
      {
        totalMinutes: 85,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
        ],
      },
      {
        totalMinutes: 115,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
        ],
      },
      {
        totalMinutes: 160,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
        ],
      },
      {
        totalMinutes: 190,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
        ],
      },
      {
        totalMinutes: 220,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
        ],
      },
      {
        totalMinutes: 250,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
        ],
      },
      {
        totalMinutes: 295,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
        ],
      },
      {
        totalMinutes: 325,
        expectedTypes: [
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
          TimerSessionType.LongRest,
          TimerSessionType.Focus,
          TimerSessionType.ShortRest,
          TimerSessionType.Focus,
        ],
      },
    ];

    for (const testCase of testCases) {
      const sessions = service.getTimerSessionsFromTotalSeconds(testCase.totalMinutes * 60);
      const actualTypes = sessions.map((session) => session.type);
      const totalDurationInMs = sessions.reduce((acc, session) => acc + session.durationInMs, 0);

      expect(actualTypes).toEqual(testCase.expectedTypes);
      expect(totalDurationInMs).toBe(testCase.totalMinutes * 60 * 1000);
    }
  });

  it('should throw for non-positive or non-integer total seconds', () => {
    expect(() => service.getTimerSessionsFromTotalSeconds(0)).toThrowError('totalSeconds must be a positive integer');
    expect(() => service.getTimerSessionsFromTotalSeconds(-5)).toThrowError('totalSeconds must be a positive integer');
    expect(() => service.getTimerSessionsFromTotalSeconds(1.5)).toThrowError('totalSeconds must be a positive integer');
  });

  it('should throw when total seconds does not match complete sessions', () => {
    expect(() => service.getTimerSessionsFromTotalSeconds(26 * 60)).toThrowError(
      'totalSeconds does not map to complete Pomodoro sessions',
    );
  });
});
