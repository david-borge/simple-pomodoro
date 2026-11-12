import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import type { PredefinedColors } from '@ionic/core/components';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SessionsInfoComponent } from '../../components/sessions-info/sessions-info.component';
import { TimerAndCircleComponent } from '../../components/timer-and-circle/timer-and-circle.component';
import { TIMER_CONFIG } from '../../config/timer.config';
import { ONE_MINUTE_IN_SECONDS } from '../../constants/time-conversion.constants';
import { TimerService } from '../../services/timer/timer.service';

@Component({
  selector: 'app-simple-pomodoro',
  templateUrl: 'simple-pomodoro.prototype-1.page.html',
  styleUrls: ['simple-pomodoro.prototype-1.page.scss'],
  imports: [
    CommonModule,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    SessionsInfoComponent,
    TimerAndCircleComponent,
  ],
})
export class SimplePomodoroPrototype1Page {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = signal(TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS);

  constructor() {
    this.timerService.totalSeconds$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((timeInSec) => {
      this.totalSeconds.set(timeInSec);

      if (this.totalSeconds() < 0) {
        this.timerService.cancelTimer();
      }
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
    return (
      this.timerService.isTimerBeingEdited ||
      (!this.timerService.isTimerBeingEdited &&
        this.totalSeconds() > TIMER_CONFIG.sessions.showSessionsInfoThresholdInMin * ONE_MINUTE_IN_SECONDS)
    );
  }
}
