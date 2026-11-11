import { IonButton, IonContent, IonHeader } from '@ionic/angular';
import type { PredefinedColors } from '@ionic/core/components';

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SessionsInfoComponent } from '../../components/sessions-info/sessions-info.component';
import { TimerComponent } from '../../components/timer/timer.component';
import { TIMER_CONFIG } from '../../config/timer.config';
import { INITIAL_TIMER_VALUE_IN_SEC } from '../../constants/initial-timer-value.const';
import { ONE_MINUTE_IN_SECONDS } from '../../constants/time-conversion.constants';
import { TimerService } from '../../services/timer/timer.service';

@Component({
  selector: 'app-simple-pomodoro',
  templateUrl: 'simple-pomodoro.page.html',
  styleUrls: ['simple-pomodoro.page.scss'],
  imports: [IonButton, IonContent, IonHeader, SessionsInfoComponent, TimerComponent],
})
export class SimplePomodoroPage {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = signal(INITIAL_TIMER_VALUE_IN_SEC);

  constructor() {
    this.timerService.totalSeconds$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((timeInSec) => {
      this.totalSeconds.set(timeInSec);
    });
  }

  onClickStartPauseBtn() {
    if (this.timerService.isTimerRunning) {
      this.timerService.pauseTimer();
      return;
    }

    this.timerService.startTimer();
  }

  onClickCancelBtn() {
    this.timerService.cancelTimer();
  }

  startPauseBtnColor(): PredefinedColors {
    return !this.timerService.isTimerRunning ? 'dark' : 'medium';
  }

  startPauseBtnText(): string {
    if (!this.timerService.isTimerRunning && this.timerService.isTimerCancelled) {
      return 'Start';
    } else if (!this.timerService.isTimerRunning && !this.timerService.isTimerCancelled) {
      return 'Continue';
    } else {
      return 'Pause';
    }
  }

  showSessionInfo() {
    return this.totalSeconds() > TIMER_CONFIG.sessions.showSessionsInfoThresholdInMin * ONE_MINUTE_IN_SECONDS;
  }
}
