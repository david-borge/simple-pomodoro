import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TwoDigitsPipe } from '../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../services/time-conversion/time-conversion.service';
import { TimerService } from '../../services/timer/timer.service';
import { TimerEditComponent } from '../timer-edit/timer-edit.component';
import { CircleComponent } from './circle/circle.component';
import { EditButtonComponent } from './edit-button/edit-button.component';

@Component({
  selector: 'app-timer-and-circle',
  templateUrl: './timer-and-circle.component.html',
  styleUrls: ['./timer-and-circle.component.scss'],
  imports: [CircleComponent, EditButtonComponent, TimerEditComponent, TwoDigitsPipe],
})
export class TimerAndCircleComponent implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly timeConversionService = inject(TimeConversionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = input.required<number>();

  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));

  isTimerBeingEdited = signal<boolean | null>(null);

  ngOnInit() {
    this.timerService.isTimerBeingEdited$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isTimerBeingEdited) => {
      this.isTimerBeingEdited.set(isTimerBeingEdited);
    });
  }
}
