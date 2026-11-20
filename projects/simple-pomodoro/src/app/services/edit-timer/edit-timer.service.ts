import { Service } from '@angular/core';

import { TimerEditorOptions } from './timer-editor.options.type';
import { TIMER_CONFIG } from '../../config/timer.config.production';
import { ONE_MINUTE_IN_SECONDS, SECONDS_PER_HOUR } from '../../constants/time-conversion.constants';

@Service()
export class EditTimerService {
    public getTimerEditorOptions(): TimerEditorOptions {
        let timerEditorOptions: TimerEditorOptions = [];
        let counterInSec = Math.round(
            TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS,
        );
        const editorIntervalInSec = Math.round(
            TIMER_CONFIG.timerEditorIntervalInMin * ONE_MINUTE_IN_SECONDS,
        );
        const maximumTimerInSec = Math.round(
            TIMER_CONFIG.maximumTimerInMin * ONE_MINUTE_IN_SECONDS,
        );

        do {
            timerEditorOptions.push({
                timeInSec: counterInSec,
                text: this.getFormattedTime(counterInSec),
            });
            counterInSec += editorIntervalInSec;
        } while (counterInSec <= maximumTimerInSec);

        return timerEditorOptions;
    }

    private getFormattedTime(totalSeconds: number): string {
        const wholeSeconds = Math.round(totalSeconds);

        const hours = Math.floor(wholeSeconds / SECONDS_PER_HOUR);
        const minutes = Math.floor((wholeSeconds % SECONDS_PER_HOUR) / 60);
        const seconds = wholeSeconds % ONE_MINUTE_IN_SECONDS;

        const timeParts: string[] = [];

        if (hours > 0) {
            timeParts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
        }

        if (minutes > 0) {
            timeParts.push(`${minutes} min`);
        }

        if (seconds > 0 && TIMER_CONFIG.sessions.focusSessionDurationInMin < 1) {
            timeParts.push(`${seconds} sec`);
        }

        return timeParts.length > 0 ? timeParts.join(' ') : '0 min';
    }
}
