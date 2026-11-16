import { IonIcon } from '@ionic/angular';

import { Component, input } from '@angular/core';

import { ONE_SECOND_IN_MILIISECONDS } from '../../../constants/time-conversion.constants';
import { TimerSession } from '../../../services/timer-sessions/timer-session.interface';

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.scss'],
  imports: [IonIcon],
})
export class AlarmComponent {
  readonly currentTimerSession = input.required<TimerSession | null>();

  protected get alarmTime() {
    const currentTimerSession = this.currentTimerSession();

    if (!currentTimerSession) return;

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

    return `${hours}:${minutes}`;
  }

  private formatNumberWithTwoDigits(number: number): string {
    return number.toString().padStart(2, '0');
  }
}
