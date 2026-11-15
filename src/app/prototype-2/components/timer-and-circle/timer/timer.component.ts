import { IonChip } from '@ionic/angular';

import { Component, computed, inject, input } from '@angular/core';

import { CustomIonicColors } from '../../../design-system/ionic-colors';
import { TwoDigitsPipe } from '../../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../../services/time-conversion/time-conversion.service';
import { TimerSession, TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../../services/timer-sessions/timer-sessions.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [IonChip, TwoDigitsPipe],
})
export class TimerComponent {
  private readonly timeConversionService = inject(TimeConversionService);
  private readonly timerSessionsService = inject(TimerSessionsService);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean | null>();
  readonly isTimerPaused = input.required<boolean | null>();
  readonly currentTimerSession = input.required<TimerSession | null>();

  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));

  protected get sessionTypeIonChipColor(): CustomIonicColors {
    switch (this.currentTimerSession()?.type) {
      case TimerSessionType.Focus:
        return CustomIonicColors.Focus;

      case TimerSessionType.ShortRest:
      case TimerSessionType.LongRest:
        return CustomIonicColors.Rest;

      default:
        return CustomIonicColors.Focus;
    }
  }

  protected get currentTimerSessionText() {
    return this.timerSessionsService.getTimerSessionTypeText(this.currentTimerSession()?.type);
  }
}
