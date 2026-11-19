// TODO: add protected to functions that are only used in template

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SessionsInfoComponent } from '../../components/sessions-info/sessions-info.component';
import { TimerAndCircleComponent } from '../../components/timer-and-circle/timer-and-circle.component';
import { TimerControlsStartPauseCancelComponent } from '../../components/timer-controls-start-pause-cancel/timer-controls-start-pause-cancel.component';
import { TIMER_CONFIG } from '../../config/timer.config';
import { ONE_MINUTE_IN_SECONDS } from '../../constants/time-conversion.constants';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';
import { TimerService } from '../../services/timer/timer.service';

@Component({
    selector: 'app-prototype-2',
    templateUrl: 'prototype-2.page.html',
    styleUrls: ['prototype-2.page.scss'],
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
export class Prototype2Page {
    private readonly timerService = inject(TimerService);
    private readonly timerSessionsService = inject(TimerSessionsService);
    private readonly destroyRef = inject(DestroyRef);

    readonly totalSeconds = signal(TIMER_CONFIG.defautlTimerDurationInMin * ONE_MINUTE_IN_SECONDS);

    constructor() {
        this.timerService.totalSeconds$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((timeInSec) => {
                this.totalSeconds.set(timeInSec);

                if (timeInSec <= 0) {
                    this.timerService.cancelTimer();
                }
            });
    }

    showSessionInfo() {
        const totalSeconds = this.totalSeconds();
        const plannedTotalSeconds = this.timerService.editedTotalSeconds;

        return (
            this.timerService.isTimerBeingEdited ||
            totalSeconds <= 0 ||
            this.timerSessionsService.getTimerSessionsFromTotalSeconds(plannedTotalSeconds)
                .length !== 1
        );
    }
}
