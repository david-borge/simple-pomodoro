import { IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular';

import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { EditTimerService } from '../../services/edit-timer/edit-timer.service';
import { TimerEditorOptions } from '../../services/edit-timer/timer-editor.options.type';
import { IonicPickerHelperService } from '../../services/ionic-picker-helper/ionic-picker-helper';
import { TimerService } from '../../services/timer/timer.service';

enum TimerEditFormInput {
  PickerInput = 'picker_input',
}

@Component({
  selector: 'app-timer-edit',
  templateUrl: './timer-edit.component.html',
  styleUrls: ['./timer-edit.component.scss'],
  imports: [FormsModule, IonPicker, IonPickerColumn, IonPickerColumnOption],
})
export class TimerEditComponent {
  private readonly timerService = inject(TimerService);
  private readonly editTimerService = inject(EditTimerService);
  private readonly formPickerHelperService = inject(IonicPickerHelperService);

  timerEditorOptions = signal<TimerEditorOptions>(this.editTimerService.getTimerEditorOptions());
  pickerInputValue = signal(this.getDefaultEditorTimeOptions().timeInSec.toString());
  COMPLETE_FORM_EXAMPLE_INPUT = TimerEditFormInput;

  protected onPickerInputChange(event: CustomEvent<{ value: string | number | undefined }>) {
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

    this.timerService.editTimer(Number(this.pickerInputValue()));
  }

  protected onSubmit(completeFormExample: NgForm) {
    // const pickerInputValue = completeFormExample.value[TimerEditFormInput.PickerInput];
    // console.log('pickerInputValue:', pickerInputValue);
  }

  private getDefaultEditorTimeOptions() {
    return (
      this.timerEditorOptions().find(
        (timerEditorOption) => timerEditorOption.timeInSec === this.timerService.editedTotalSeconds,
      ) || this.timerEditorOptions()[0]
    );
  }
}
