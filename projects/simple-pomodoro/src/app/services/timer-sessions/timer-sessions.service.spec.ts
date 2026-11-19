import { TestBed } from '@angular/core/testing';

import { TimerSessionType } from './timer-session.interface';
import { TimerSessionsService } from './timer-sessions.service';

describe('TimerSessionsService', () => {
    let service: TimerSessionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerSessionsService);
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
                expectedTypes: [
                    TimerSessionType.Focus,
                    TimerSessionType.ShortRest,
                    TimerSessionType.Focus,
                ],
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
            const totalDurationInSec = sessions.reduce(
                (acc, session) => acc + session.durationInSec,
                0,
            );

            expect(actualTypes).toEqual(testCase.expectedTypes);
            expect(totalDurationInSec).toBe(testCase.totalMinutes * 60);
        }
    });

    it('should throw for non-positive or non-integer total seconds', () => {
        expect(() => service.getTimerSessionsFromTotalSeconds(0)).toThrowError(
            'totalSeconds must be a positive integer',
        );
        expect(() => service.getTimerSessionsFromTotalSeconds(-5)).toThrowError(
            'totalSeconds must be a positive integer',
        );
        expect(() => service.getTimerSessionsFromTotalSeconds(1.5)).toThrowError(
            'totalSeconds must be a positive integer',
        );
    });

    it('should use a partial short rest when remaining time cannot complete it', () => {
        const sessions = service.getTimerSessionsFromTotalSeconds(26 * 60);

        expect(sessions).toEqual([
            { durationInSec: 25 * 60, type: TimerSessionType.Focus },
            { durationInSec: 60, type: TimerSessionType.ShortRest },
        ]);
    });

    it('should use a partial focus session when remaining time cannot complete it', () => {
        const sessions = service.getTimerSessionsFromTotalSeconds(10 * 60);

        expect(sessions).toEqual([{ durationInSec: 10 * 60, type: TimerSessionType.Focus }]);
    });

    it('should use a partial long rest when it is the next session in sequence', () => {
        const completeCycleInSec = 4 * 25 * 60 + 3 * 5 * 60;
        const sessions = service.getTimerSessionsFromTotalSeconds(completeCycleInSec + 10 * 60);

        expect(sessions.at(-1)).toEqual({
            durationInSec: 10 * 60,
            type: TimerSessionType.LongRest,
        });
    });
});
