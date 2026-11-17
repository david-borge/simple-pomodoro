import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';
import { BulletColorClass } from './bullet-color.enum';
import { BulletFillClass, BulletFillType } from './bullet-fill.enum';

@Component({
  selector: 'app-bullet',
  templateUrl: './bullet.component.html',
  styleUrls: ['./bullet.component.scss'],
  imports: [CommonModule],
})
export class BulletComponent {
  readonly BulletFillType = input.required<BulletFillType>();
  readonly isCompleted = input(false);
  readonly isTimerBeingEdited = input.required<boolean>();
  readonly timerSessionType = input.required<TimerSessionType>();

  getBulletColorClass() {
    switch (this.timerSessionType()) {
      case TimerSessionType.Focus:
        return BulletColorClass.Focus;

      case TimerSessionType.ShortRest:
      case TimerSessionType.LongRest:
        return BulletColorClass.Rest;

      default:
        return BulletColorClass.Focus;
    }
  }

  getBulletFillClass(): BulletFillClass {
    switch (this.BulletFillType()) {
      case BulletFillType.Solid:
        return BulletFillClass.Solid;

      case BulletFillType.Outline:
        return BulletFillClass.Outline;

      default:
        return BulletFillClass.Solid;
    }
  }
}
