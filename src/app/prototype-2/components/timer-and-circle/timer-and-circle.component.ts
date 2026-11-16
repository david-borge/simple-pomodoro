import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TimerSession } from '../../services/timer-sessions/timer-session.interface';
import { TimerService } from '../../services/timer/timer.service';
import { TimerEditComponent } from '../timer-edit/timer-edit.component';
import { AlarmComponent } from './alarm/alarm.component';
import { CircleComponent } from './circle/circle.component';
import { EditButtonComponent } from './edit-button/edit-button.component';
import { TimerComponent } from './timer/timer.component';

@Component({
  selector: 'app-timer-and-circle',
  templateUrl: './timer-and-circle.component.html',
  styleUrls: ['./timer-and-circle.component.scss'],
  imports: [AlarmComponent, CircleComponent, EditButtonComponent, TimerComponent, TimerEditComponent],
})
export class TimerAndCircleComponent implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = input.required<number>();

  isTimerRunning = signal<boolean | null>(null);
  isTimerPaused = signal<boolean | null>(null);
  isTimerBeingEdited = signal<boolean | null>(null);

  currentTimerSession = signal<TimerSession | null>(null);

  ngOnInit() {
    this.timerService.timerStatus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ isTimerRunning, isTimerPaused, isTimerBeingEdited }) => {
        this.isTimerRunning.set(isTimerRunning);
        this.isTimerPaused.set(isTimerPaused);
        this.isTimerBeingEdited.set(isTimerBeingEdited);
      });

    this.timerService.currentTimerSession$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentTimerSession) => {
        this.currentTimerSession.set(currentTimerSession);
      });
  }
}
