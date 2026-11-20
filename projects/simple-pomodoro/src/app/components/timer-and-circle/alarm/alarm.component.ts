import { IonIcon } from '@ionic/angular';

import { Component, inject, input, OnChanges, signal, SimpleChanges } from '@angular/core';

import {
    ONE_MINUTE_IN_SECONDS,
    ONE_SECOND_IN_MILIISECONDS,
} from '../../../constants/time-conversion.constants';
import { TimerSession } from '../../../services/timer-sessions/timer-session.interface';
import { TimerService } from '../../../services/timer/timer.service';

@Component({
    selector: 'app-alarm',
    templateUrl: './alarm.component.html',
    styleUrls: ['./alarm.component.scss'],
    imports: [IonIcon],
})
export class AlarmComponent implements OnChanges {
    private readonly timerService = inject(TimerService);

    readonly currentTimerSession = input.required<TimerSession | null>();
    protected readonly alarmTime = signal('');
    protected readonly skipInitialAnimation = signal(false);

    constructor() {
        if (this.timerService.wasRestoredFromPersistentState) {
            this.skipInitialAnimation.set(true);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        const sessionChange = changes['currentTimerSession'];

        if (sessionChange && !sessionChange.firstChange && this.skipInitialAnimation()) {
            this.skipInitialAnimation.set(false);
        }

        if (sessionChange?.currentValue) {
            this.alarmTime.set(this.getAlarmTime());
        }
    }

    private getAlarmTime(): string {
        const currentTimerSession = this.currentTimerSession();

        if (!currentTimerSession) return '';

        const now = new Date();
        const alarmDate = this.addSecondsToDate(now, currentTimerSession.durationInSec);
        return this.getTimeFromDate(alarmDate);
    }

    private addSecondsToDate(date: Date, seconds: number) {
        return new Date(date.getTime() + seconds * ONE_SECOND_IN_MILIISECONDS);
    }

    private getTimeFromDate(date: Date): string {
        const hours = this.formatNumberWithTwoDigits(date.getHours());
        const minutes = this.formatNumberWithTwoDigits(date.getMinutes());

        let time = `${hours}:${minutes}`;

        const currentTimerSession = this.currentTimerSession();
        if (currentTimerSession && currentTimerSession.durationInSec < ONE_MINUTE_IN_SECONDS) {
            const seconds = this.formatNumberWithTwoDigits(date.getSeconds());
            time += `:${seconds}`;
        }

        return time;
    }

    private formatNumberWithTwoDigits(number: number): string {
        return number.toString().padStart(2, '0');
    }
}
