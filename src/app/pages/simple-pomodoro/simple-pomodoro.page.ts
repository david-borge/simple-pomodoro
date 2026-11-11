import { IonButton, IonContent, IonHeader } from '@ionic/angular';
import type { PredefinedColors } from '@ionic/core/components';

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TimerComponent } from '../../components/timer/timer.component';
import { TimerService } from '../../services/timer/timer.service';

@Component({
  selector: 'app-simple-pomodoro',
  templateUrl: 'simple-pomodoro.page.html',
  styleUrls: ['simple-pomodoro.page.scss'],
  imports: [IonButton, IonContent, IonHeader, TimerComponent],
})
export class SimplePomodoroPage {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = signal(0);

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
}
