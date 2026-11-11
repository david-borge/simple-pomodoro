import { Component, ElementRef, inject, input, OnInit, Renderer2, signal } from '@angular/core';

import { TimerSessionsList, TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';
import { BulletComponent } from './bullet/bullet.component';
import { SessionsInfoService } from './sessions-info.service';

@Component({
  selector: 'app-sessions-info',
  templateUrl: './sessions-info.component.html',
  styleUrls: ['./sessions-info.component.scss'],
  imports: [BulletComponent],
})
export class SessionsInfoComponent implements OnInit {
  private readonly timerSessionsService = inject(TimerSessionsService);
  private readonly sessionsInfoService = inject(SessionsInfoService);
  private readonly renderer = inject(Renderer2);
  private readonly el = inject(ElementRef);

  readonly totalSeconds = input.required<number>();

  // Exposed publicly so the template can bind to timerSessionsList without modifications
  readonly timerSessionsList = signal<TimerSessionsList>([]);

  TimerSessionType = TimerSessionType;

  ngOnInit(): void {
    this.timerSessionsList.set(this.timerSessionsService.getTimerSessionsFromTotalSeconds(2 * 60 * 60));
    // this.timerSessionsList.set(this.timerSessionsService.getTimerSessionsFromTotalSeconds(this.totalSeconds()));

    const focusSessions = this.timerSessionsService.getNumberOfSessionsOfAParticulaType(
      this.timerSessionsList(),
      TimerSessionType.Focus,
    );
    const shortRestSessions = this.timerSessionsService.getNumberOfSessionsOfAParticulaType(
      this.timerSessionsList(),
      TimerSessionType.ShortRest,
    );
    const longRestSessions = this.timerSessionsService.getNumberOfSessionsOfAParticulaType(
      this.timerSessionsList(),
      TimerSessionType.LongRest,
    );

    this.sessionsInfoService.renderSessionsInfo(
      this.el,
      this.renderer,
      focusSessions,
      shortRestSessions,
      longRestSessions,
    );
  }
}
