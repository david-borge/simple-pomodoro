import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SessionsInfoComponent } from '../../components/sessions-info/sessions-info.component';
import { TimerAndCircleComponent } from '../../components/timer-and-circle/timer-and-circle.component';
import { TIMER_CONFIG } from '../../config/timer.config';
import { ONE_MINUTE_IN_SECONDS } from '../../constants/time-conversion.constants';
import { IonicColors } from '../../design-system/ionic-colors';
import { TimerService } from '../../services/timer/timer.service';

@Component({
  selector: 'app-design-1',
  templateUrl: 'design-1.page.html',
  styleUrls: ['design-1.page.scss'],
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
export class Design1Page {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = signal(TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS);

  @ViewChild('startPauseBtnLocalRef') private readonly startPauseBtnEl!: ElementRef<IonButton>;

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

  startPauseBtnColor(): IonicColors {
    // TODO: change condition based on focus/rest when that is implemented
    return !this.timerService.isTimerRunning ? 'focus' : 'focus';
    // return !this.timerService.isTimerRunning ? 'focus' : 'rest';
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
