import { IonButton, IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular';

import { Component, computed, inject, input, signal } from '@angular/core';

import { TwoDigitsPipe } from '../../pipes/two-digits.pipe';
import { EditTimerService } from '../../services/edit-timer/edit-timer.service';
import { TimerEditorOptions } from '../../services/edit-timer/timer-editor.options.interface';
import { TimeConversionService } from '../../services/time-conversion/time-conversion.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [IonButton, IonPicker, IonPickerColumn, IonPickerColumnOption, TwoDigitsPipe],
})
export class TimerComponent {
  private readonly timeConversionService = inject(TimeConversionService);
  private readonly editTimerService = inject(EditTimerService);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean>();

  timerIsBeingEdited = signal(false);
  timerEditorOptions = signal<TimerEditorOptions['options'] | null>(null);

  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));

  onClickEditBtn() {
    this.timerIsBeingEdited.set(true);
    this.timerEditorOptions.set(this.editTimerService.getTimerEditorOptions());
  }
}
