import { IonButton } from '@ionic/angular';

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CustomIonicColors, IonicColors } from '../../design-system/ionic-colors';
import { TimerService } from '../../services/timer/timer.service';

@Component({
  selector: 'app-timer-controls-start-pause-cancel',
  templateUrl: './timer-controls-start-pause-cancel.component.html',
  styleUrls: ['./timer-controls-start-pause-cancel.component.scss'],
  imports: [IonButton],
})
export class TimerControlsStartPauseCancelComponent {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isCancelButtonVisible = signal(this.timerService.isTimerPaused);

  constructor() {
    this.timerService.timerStatus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ isTimerPaused }) => {
      this.isCancelButtonVisible.set(isTimerPaused);
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

  startPauseBtnColor(): IonicColors {
    // TODO: change condition based on focus/rest when that is implemented
    // TODO: move values to enum
    return !this.timerService.isTimerRunning ? CustomIonicColors.Focus : CustomIonicColors.Focus;
    // return !this.timerService.isTimerRunning ? CustomIonicColors.Focus : CustomIonicColors.Rest;
  }

  startPauseBtnFill() {
    // TODO: move values to enum or take from Ionic interface or stg
    return !this.timerService.isTimerRunning ? 'solid' : 'outline';
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
