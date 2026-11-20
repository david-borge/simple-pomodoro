import { Service } from '@angular/core';

import { TimerEditorOptions } from './timer-editor.options.type';
import { TIMER_CONFIG } from '../../config/timer.config';
import { MAXIMUM_TIMER } from '../../constants/maximum-timer.constant';
import { ONE_MINUTE_IN_SECONDS, SECONDS_PER_HOUR } from '../../constants/time-conversion.constants';
import { TIMER_EDITOR_INTERVAL_IN_SEC } from '../../constants/timer-editor-interval.constant';

@Service()
export class EditTimerService {
    public getTimerEditorOptions(): TimerEditorOptions {
        let timerEditorOptions: TimerEditorOptions = [];
        let counterInSec = TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS;

        do {
            timerEditorOptions.push({
                timeInSec: counterInSec,
                text: this.getFormattedTime(counterInSec),
            });
            counterInSec += TIMER_EDITOR_INTERVAL_IN_SEC;
        } while (counterInSec <= MAXIMUM_TIMER);

        return timerEditorOptions;
    }

    private getFormattedTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (seconds < SECONDS_PER_HOUR) {
            return `${minutes} min`;
        }

        let hoursString = '';
        if (hours === 1) {
            hoursString = `${hours} hr`;
        } else if (hours > 1) {
            hoursString = `${hours} hrs`;
        }

        let minutesString = minutes > 0 ? `${minutes} min` : '';

        let spaceString = hoursString !== '' && minutesString !== '' ? ' ' : '';

        return `${hoursString}${spaceString}${minutesString}`;
    }
}
