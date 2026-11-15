import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TimerService } from '../../services/timer/timer.service';
import { TimerEditComponent } from '../timer-edit/timer-edit.component';
import { CircleComponent } from './circle/circle.component';
import { EditButtonComponent } from './edit-button/edit-button.component';
import { TimerComponent } from './timer/timer.component';

@Component({
  selector: 'app-timer-and-circle',
  templateUrl: './timer-and-circle.component.html',
  styleUrls: ['./timer-and-circle.component.scss'],
  imports: [CircleComponent, EditButtonComponent, TimerComponent, TimerEditComponent],
})
export class TimerAndCircleComponent implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = input.required<number>();

  isTimerBeingEdited = signal<boolean | null>(null);

  ngOnInit() {
    this.timerService.timerStatus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ isTimerBeingEdited }) => {
      this.isTimerBeingEdited.set(isTimerBeingEdited);
    });
  }
}
