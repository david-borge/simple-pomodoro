import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnChanges,
  Renderer2,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TimerSessionsList, TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';
import { TimerService } from '../../services/timer/timer.service';
import { BulletFillType } from './bullet/bullet-fill.enum';
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
  private readonly timerService = inject(TimerService);
  private readonly sessionsInfoService = inject(SessionsInfoService);
  private readonly renderer = inject(Renderer2);
  private readonly el = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = input.required<number>();
  readonly plannedTotalSeconds = input.required<number>();
  readonly timerStatus = signal({
    isTimerRunning: this.timerService.isTimerRunning,
    isTimerPaused: this.timerService.isTimerPaused,
    isTimerCancelled: this.timerService.isTimerCancelled,
    isTimerBeingEdited: this.timerService.isTimerBeingEdited,
  });

  // Exposed publicly so the template can bind to timerSessionsList without modifications
  readonly timerSessionsList = signal<TimerSessionsList>([]);
  readonly currentSessionIndex = signal(0);

  TimerSessionType = TimerSessionType;

  private viewInitialized = false;
  private lastRenderedSessionCounts: [number, number, number, boolean] | null = null;
  private remainingTimerSessionsList: TimerSessionsList = [];

  BulletFillType = BulletFillType;

  constructor() {
    this.timerService.timerStatus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((timerStatus) => {
      this.timerStatus.set(timerStatus);

      if (this.viewInitialized) {
        this.renderSessionsInfoIfChanged();
      }
    });
  }

  ngOnChanges(): void {
    const plannedTotalSeconds = this.plannedTotalSeconds();
    const timerSessionsList = this.timerSessionsService.getTimerSessionsFromTotalSeconds(plannedTotalSeconds);

    this.timerSessionsList.set(timerSessionsList);
    this.currentSessionIndex.set(
      this.getCurrentSessionIndex(timerSessionsList, plannedTotalSeconds, this.totalSeconds()),
    );
    this.remainingTimerSessionsList = timerSessionsList.slice(this.currentSessionIndex());

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
      this.remainingTimerSessionsList,
      TimerSessionType.Focus,
    );
    const shortRestSessions = this.timerSessionsService.getNumberOfSessionsOfAParticulaType(
      this.remainingTimerSessionsList,
      TimerSessionType.ShortRest,
    );
    const longRestSessions = this.timerSessionsService.getNumberOfSessionsOfAParticulaType(
      this.remainingTimerSessionsList,
      TimerSessionType.LongRest,
    );
    const sessionCounts: [number, number, number, boolean] = [
      focusSessions,
      shortRestSessions,
      longRestSessions,
      this.timerStatus().isTimerRunning,
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
      this.timerStatus().isTimerRunning,
    );
  }

  private getCurrentSessionIndex(
    timerSessionsList: TimerSessionsList,
    plannedTotalSeconds: number,
    remainingTotalSeconds: number,
  ): number {
    let elapsedSeconds = Math.max(plannedTotalSeconds - remainingTotalSeconds, 0);

    for (let index = 0; index < timerSessionsList.length; index++) {
      const timerSession = timerSessionsList[index];

      if (elapsedSeconds < timerSession.durationInSec || index === timerSessionsList.length - 1) {
        return index;
      }

      elapsedSeconds -= timerSession.durationInSec;
    }

    return 0;
  }
}
