import { IonButton } from '@ionic/angular';

import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { TwoDigitsPipe } from '../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../services/time-conversion/time-conversion.service';
import { TimerService } from '../../services/timer/timer.service';
import { TimerEditComponent } from '../timer-edit/timer-edit.component';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [FormsModule, IonButton, TimerEditComponent, TwoDigitsPipe],
})
export class TimerComponent implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly timeConversionService = inject(TimeConversionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean>();

  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));

  isTimerBeingEdited = signal<boolean | null>(null);

  ngOnInit() {
    this.timerService.isTimerBeingEdited$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isTimerBeingEdited) => {
      this.isTimerBeingEdited.set(isTimerBeingEdited);
    });
  }

  onClickEditBtn() {
    this.timerService.starEditingTimer();
    // console.log(this.editTimerService.getTimerEditorOptions());
  }
}
