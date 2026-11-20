import { IonIcon } from '@ionic/angular';

import { Component, input, OnChanges, signal, SimpleChanges } from '@angular/core';

import {
    ONE_MINUTE_IN_SECONDS,
    ONE_SECOND_IN_MILIISECONDS,
} from '../../../constants/time-conversion.constants';
import { TimerSession } from '../../../services/timer-sessions/timer-session.interface';

@Component({
    selector: 'app-alarm',
    templateUrl: './alarm.component.html',
    styleUrls: ['./alarm.component.scss'],
    imports: [IonIcon],
})
export class AlarmComponent implements OnChanges {
    readonly currentTimerSession = input.required<TimerSession | null>();

    protected readonly alarmTime = signal('');

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentTimerSession']?.currentValue) {
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
