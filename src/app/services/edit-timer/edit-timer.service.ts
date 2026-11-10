import { Service } from '@angular/core';

import { INITIAL_TIMER_VALUE_IN_SEC } from '../../constants/initial-timer-value.const';
import { MAXIMUM_TIMER } from '../../constants/maximum-timer.constant';
import { TimerEditorOptions } from './timer-editor.options.interface';

@Service()
export class EditTimerService {
  getTimerEditorOptions(): TimerEditorOptions['options'] {
    let timerEditorOptions!: TimerEditorOptions['options'];
    let counterInSec = INITIAL_TIMER_VALUE_IN_SEC;

    do {
      timerEditorOptions.push({
        timeInSec: counterInSec,
        text: `${counterInSec} seconds`,
      });
      counterInSec++;
    } while (counterInSec <= MAXIMUM_TIMER);

    return timerEditorOptions;
  }
}
