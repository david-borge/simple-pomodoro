import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';

@Component({
    selector: 'app-bullet',
    templateUrl: './bullet.component.html',
    styleUrls: ['./bullet.component.scss'],
    imports: [CommonModule],
})
export class BulletComponent {
    readonly timerSessionType = input.required<TimerSessionType>();

    getBulletColor() {
        switch (this.timerSessionType()) {
            case TimerSessionType.Focus:
                return 'focus-color';

            case TimerSessionType.ShortRest:
            case TimerSessionType.LongRest:
                return 'rest-color';

            default:
                return 'focus-color';
        }
    }
}
