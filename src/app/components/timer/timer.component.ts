import { IonButton, IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular';

import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { TwoDigitsPipe } from '../../pipes/two-digits.pipe';
import { EditTimerService } from '../../services/edit-timer/edit-timer.service';
import { TimerEditorOptions } from '../../services/edit-timer/timer-editor.options.type';
import { IonicPickerHelperService } from '../../services/ionic-picker-helper/ionic-picker-helper';
import { TimeConversionService } from '../../services/time-conversion/time-conversion.service';

enum COMPLETE_FORM_EXAMPLE_INPUT {
  PickerInput = 'picker_input',
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [FormsModule, IonButton, IonPicker, IonPickerColumn, IonPickerColumnOption, TwoDigitsPipe],
})
export class TimerComponent {
  private readonly timeConversionService = inject(TimeConversionService);
  private readonly editTimerService = inject(EditTimerService);
  private readonly formPickerHelperService = inject(IonicPickerHelperService);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean>();

  timerIsBeingEdited = signal(false);
  timerEditorOptions = signal<TimerEditorOptions>(this.editTimerService.getTimerEditorOptions());
  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));
  pickerInputValue = signal(this.timerEditorOptions()[0].timeInSec.toString());
  COMPLETE_FORM_EXAMPLE_INPUT = COMPLETE_FORM_EXAMPLE_INPUT;

  onClickEditBtn() {
    this.timerIsBeingEdited.set(true);
    // console.log(this.editTimerService.getTimerEditorOptions());
  }

  onPickerInputChange(event: CustomEvent<{ value: string | number | undefined }>) {
    const timerEditorValuesStringArray = this.timerEditorOptions().map((timerEditorOption) =>
      timerEditorOption.timeInSec.toString(),
    );
    const timerEditorValuesStringSet = new Set(timerEditorValuesStringArray);

    this.pickerInputValue.set(
      this.formPickerHelperService.getIonicPickerValueFromChangeEvent(
        event,
        this.pickerInputValue(),
        timerEditorValuesStringSet,
      ),
    );
  }

  onSubmit(completeFormExample: NgForm) {
    const pickerInputValue = completeFormExample.value[COMPLETE_FORM_EXAMPLE_INPUT.PickerInput];
    console.log('pickerInputValue:', pickerInputValue);
  }
}
