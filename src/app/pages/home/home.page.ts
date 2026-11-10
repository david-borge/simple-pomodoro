import { IonButton, IonContent, IonHeader } from '@ionic/angular';
import type { PredefinedColors } from '@ionic/core/components';

import { Component, inject, signal } from '@angular/core';

import { TimerComponent } from '../../components/timer/timer.component';
import { TimerService } from '../../services/timer/timer.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonContent, IonHeader, TimerComponent],
})
export class HomePage {
  private readonly timerService = inject(TimerService);

  public readonly totalSeconds = signal(0);

  constructor() {
    this.timerService.totalSeconds$.subscribe((timeInSec) => {
      this.totalSeconds.set(timeInSec);
    });
  }

  isTimerRunning(): boolean {
    return this.timerService.isTimerRunning();
  }

  isTimerCancelled(): boolean {
    return this.timerService.isTimerCancelled();
  }

  startPauseBtnText(): string {
    if (!this.isTimerRunning() && this.isTimerCancelled()) {
      return 'Start';
    } else if (!this.isTimerRunning() && !this.isTimerCancelled()) {
      return 'Continue';
    } else {
      return 'Pause';
    }
  }

  startPauseBtnColor(): PredefinedColors {
    return !this.isTimerRunning() ? 'dark' : 'medium';
  }

  onClickStartPauseBtn() {
    if (this.isTimerRunning()) {
      this.timerService.pauseTimer();
      return;
    }

    this.timerService.startTimer();
  }

  onClickCancelBtn() {
    this.timerService.cancelTimer();
  }
}
