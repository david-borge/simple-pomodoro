import { Component } from '@angular/core';

import { TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { BulletComponent } from './bullet/bullet.component';

@Component({
  selector: 'app-sessions-info',
  templateUrl: './sessions-info.component.html',
  styleUrls: ['./sessions-info.component.scss'],
  imports: [BulletComponent],
})
export class SessionsInfoComponent {
  TimerSessionType = TimerSessionType;
}
