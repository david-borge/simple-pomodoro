import { IonButton } from '@ionic/angular';

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CustomIonicColors, IonicColors } from '../../design-system/ionic-colors';
import { TimerSession, TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
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
  readonly isCircleResetting = signal(this.timerService.isCircleResetting);
  private currentTimerSession = signal<TimerSession | null>(null);

  constructor() {
    this.timerService.timerStatus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ isTimerPaused }) => {
      this.isCancelButtonVisible.set(isTimerPaused);
    });

    this.timerService.isCircleResetting$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isCircleResetting) => {
      this.isCircleResetting.set(isCircleResetting);
    });

    this.timerService.currentTimerSession$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentTimerSession) => {
        this.currentTimerSession.set(currentTimerSession);
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
