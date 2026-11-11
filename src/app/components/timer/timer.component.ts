import { IonButton } from '@ionic/angular';

import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TwoDigitsPipe } from '../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../services/time-conversion/time-conversion.service';
import { TimerEditComponent } from '../timer-edit/timer-edit.component';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [FormsModule, IonButton, TimerEditComponent, TwoDigitsPipe],
})
export class TimerComponent {
  private readonly timeConversionService = inject(TimeConversionService);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean>();

  timerIsBeingEdited = signal(false);

  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));

  onClickEditBtn() {
    this.timerIsBeingEdited.set(true);
    // console.log(this.editTimerService.getTimerEditorOptions());
  }
}
