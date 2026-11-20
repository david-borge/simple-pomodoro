// TODO: add protected to functions that are only used in template

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SessionsInfoComponent } from '../../components/sessions-info/sessions-info.component';
import { TimerAndCircleComponent } from '../../components/timer-and-circle/timer-and-circle.component';
import { TimerControlsStartPauseCancelComponent } from '../../components/timer-controls-start-pause-cancel/timer-controls-start-pause-cancel.component';
import { TIMER_CONFIG } from '../../config/timer.config.production';
import { ONE_MINUTE_IN_SECONDS } from '../../constants/time-conversion.constants';
import { TimerService } from '../../services/timer/timer.service';
import {
    type TimerSession,
    TimerSessionType,
} from '../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';

@Component({
    selector: 'app-simple-pomodoro',
    templateUrl: 'simple-pomodoro.page.html',
    styleUrls: ['simple-pomodoro.page.scss'],
    host: {
        '[class.is-rest-session]': 'isRestSession()',
        '[class.is-ready]': 'isReady()',
    },
    imports: [
        CommonModule,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        SessionsInfoComponent,
        TimerAndCircleComponent,
        TimerControlsStartPauseCancelComponent,
    ],
})
export class SimplePomodoroPage {
    private readonly timerService = inject(TimerService);
    private readonly timerSessionsService = inject(TimerSessionsService);
    private readonly destroyRef = inject(DestroyRef);

    readonly totalSeconds = signal(TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS);
    readonly plannedTotalSeconds = signal(this.timerService.editedTotalSeconds);
    readonly isRestSession = signal(this.isRestSessionType(this.timerService.currentTimerSession));
    readonly isReady = signal(false);

    constructor() {
        this.timerService.totalSeconds$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((timeInSec) => {
                this.totalSeconds.set(timeInSec);

                if (timeInSec <= 0) {
                    this.timerService.cancelTimer();
                }
            });

        this.timerService.editedTotalSeconds$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((timeInSec) => {
                this.plannedTotalSeconds.set(timeInSec);
            });

        this.timerService.currentTimerSession$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((session) => {
                this.isRestSession.set(this.isRestSessionType(session));
            });

        afterNextRender(() => this.isReady.set(true));
    }

    private isRestSessionType(session: TimerSession | null): boolean {
        return (
            session?.type === TimerSessionType.ShortRest ||
            session?.type === TimerSessionType.LongRest
        );
    }

    showSessionInfo() {
        const totalSeconds = this.totalSeconds();
        const plannedTotalSeconds = this.plannedTotalSeconds();

        return (
            this.timerService.isTimerBeingEdited ||
            totalSeconds <= 0 ||
            this.timerSessionsService.getTimerSessionsFromTotalSeconds(plannedTotalSeconds)
                .length !== 1
        );
    }
}
