import { IonText } from '@ionic/angular';

import { Component, computed, inject, input } from '@angular/core';

import { CustomIonicColors } from '../../../design-system/ionic-colors';
import { TwoDigitsPipe } from '../../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../../services/time-conversion/time-conversion.service';
import { TimerSession, TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../../services/timer-sessions/timer-sessions.service';
import { TimerService } from '../../../services/timer/timer.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [IonText, TwoDigitsPipe],
})
export class TimerComponent {
  private readonly timeConversionService = inject(TimeConversionService);
  private readonly timerSessionsService = inject(TimerSessionsService);
  private readonly timerService = inject(TimerService);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean | null>();
  readonly isTimerPaused = input.required<boolean | null>();
  readonly currentTimerSession = input.required<TimerSession | null>();

  readonly displayedSeconds = computed(() => {
    const totalSeconds = this.totalSeconds();

    return this.currentTimerSession() ? this.timerService.currentTimerSessionRemainingSeconds : totalSeconds;
  });
  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.displayedSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.displayedSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.displayedSeconds()));

  protected get currentTimerSessionColor(): CustomIonicColors {
    switch (this.currentTimerSession()?.type) {
      case TimerSessionType.Focus:
        return CustomIonicColors.FocusDarker;

      case TimerSessionType.ShortRest:
      case TimerSessionType.LongRest:
        return CustomIonicColors.RestDarker;

      default:
        return CustomIonicColors.FocusDarker;
    }
  }

  protected get currentTimerSessionText() {
    return this.timerSessionsService.getTimerSessionTypeText(this.currentTimerSession()?.type);
  }
}
