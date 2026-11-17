import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, input, OnChanges, Renderer2, signal } from '@angular/core';

import { TimerSessionsList, TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';
import { BulletComponent } from './bullet/bullet.component';
import { SessionsInfoService } from './sessions-info.service';

@Component({
  selector: 'app-sessions-info',
  templateUrl: './sessions-info.component.html',
  styleUrls: ['./sessions-info.component.scss'],
  imports: [BulletComponent, CommonModule],
})
export class SessionsInfoComponent implements OnChanges, AfterViewInit {
  private readonly timerSessionsService = inject(TimerSessionsService);
  private readonly sessionsInfoService = inject(SessionsInfoService);
  private readonly renderer = inject(Renderer2);
  private readonly el = inject(ElementRef);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean>();

  // Exposed publicly so the template can bind to timerSessionsList without modifications
  readonly timerSessionsList = signal<TimerSessionsList>([]);

  TimerSessionType = TimerSessionType;

  private viewInitialized = false;
  private lastRenderedSessionCounts: [number, number, number, boolean] | null = null;

  ngOnChanges(): void {
    // TODO: do I need to call this fn on it changes? Would it be enough with onInit?
    this.timerSessionsList.set(this.timerSessionsService.getTimerSessionsFromTotalSeconds(this.totalSeconds()));

    if (this.viewInitialized) {
      this.renderSessionsInfoIfChanged();
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.renderSessionsInfoIfChanged();
  }

  private renderSessionsInfoIfChanged(): void {
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
    const sessionCounts: [number, number, number, boolean] = [
      focusSessions,
      shortRestSessions,
      longRestSessions,
      this.isTimerRunning(),
    ];

    if (this.lastRenderedSessionCounts?.every((count, index) => count === sessionCounts[index])) {
      return;
    }

    this.lastRenderedSessionCounts = sessionCounts;

    this.sessionsInfoService.renderSessionsInfo(
      this.el,
      this.renderer,
      focusSessions,
      shortRestSessions,
      longRestSessions,
      this.isTimerRunning(),
    );
  }
}
