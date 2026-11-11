import { Component, inject, input, OnInit } from '@angular/core';

import { TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';
import { BulletComponent } from './bullet/bullet.component';

@Component({
  selector: 'app-sessions-info',
  templateUrl: './sessions-info.component.html',
  styleUrls: ['./sessions-info.component.scss'],
  imports: [BulletComponent],
})
export class SessionsInfoComponent implements OnInit {
  private readonly timerSessionsService = inject(TimerSessionsService);

  readonly totalSeconds = input.required<number>();

  TimerSessionType = TimerSessionType;

  ngOnInit(): void {
    const timerSessions = this.timerSessionsService.getTimerSessionsFromTotalSeconds(this.totalSeconds());
  }
}
