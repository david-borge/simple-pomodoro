import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';
import { BulletBorderColorClass } from './bullet-border-color.enum';

@Component({
  selector: 'app-bullet',
  templateUrl: './bullet.component.html',
  styleUrls: ['./bullet.component.scss'],
  imports: [CommonModule],
})
export class BulletComponent {
  readonly timerSessionType = input.required<TimerSessionType>();

  getBulletColorClass() {
    switch (this.timerSessionType()) {
      case TimerSessionType.Focus:
        return BulletBorderColorClass.BorderColorFocus;

      case TimerSessionType.ShortRest:
      case TimerSessionType.LongRest:
        return BulletBorderColorClass.BorderColorRest;

      default:
        return BulletBorderColorClass.BorderColorFocus;
    }
  }
}
