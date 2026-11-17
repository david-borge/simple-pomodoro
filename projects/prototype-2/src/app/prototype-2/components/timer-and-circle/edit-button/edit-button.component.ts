import { IonButton } from '@ionic/angular';

import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TimerService } from '../../../services/timer/timer.service';

@Component({
  selector: 'app-edit-button',
  templateUrl: './edit-button.component.html',
  styleUrls: ['./edit-button.component.scss'],
  imports: [IonButton],
})
export class EditButtonComponent implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly timerStatus = signal({
    isTimerRunning: this.timerService.isTimerRunning,
    isTimerPaused: this.timerService.isTimerPaused,
  });

  protected readonly isVisible = computed(() => {
    const status = this.timerStatus();
    return !status.isTimerRunning && !status.isTimerPaused;
  });

  ngOnInit() {
    this.timerService.timerStatus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((status) => {
      this.timerStatus.set(status);
    });
  }

  protected onClickEditBtn() {
    this.timerService.starEditingTimer();
  }
}
