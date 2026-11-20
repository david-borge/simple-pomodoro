import { IonText } from '@ionic/angular';

import {
    Component,
    computed,
    inject,
    input,
    OnChanges,
    signal,
    SimpleChanges,
} from '@angular/core';

import { CustomIonicColors } from '../../../design-system/ionic-colors';
import { TwoDigitsPipe } from '../../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../../services/time-conversion/time-conversion.service';
import {
    TimerSession,
    TimerSessionType,
} from '../../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../../services/timer-sessions/timer-sessions.service';
import { TimerService } from '../../../services/timer/timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
    imports: [IonText, TwoDigitsPipe],
})
export class TimerComponent implements OnChanges {
    private readonly timeConversionService = inject(TimeConversionService);
    private readonly timerSessionsService = inject(TimerSessionsService);
    private readonly timerService = inject(TimerService);

    protected readonly skipInitialAnimation = signal(false);

    constructor() {
        if (this.timerService.wasRestoredFromPersistentState) {
            this.skipInitialAnimation.set(true);
        }
    }

    readonly totalSeconds = input.required<number>();
    readonly isTimerRunning = input.required<boolean | null>();
    readonly isTimerPaused = input.required<boolean | null>();
    readonly currentTimerSession = input.required<TimerSession | null>();

    ngOnChanges(changes: SimpleChanges): void {
        const sessionChange = changes['currentTimerSession'];

        if (
            sessionChange &&
            !sessionChange.firstChange &&
            sessionChange.previousValue?.type !== sessionChange.currentValue?.type
        ) {
            this.skipInitialAnimation.set(false);
        }
    }

    readonly firstSessionDurationInSeconds = computed(() => {
        const totalSeconds = this.totalSeconds();

        if (totalSeconds <= 0) {
            return totalSeconds;
        }

        const timerSessions =
            this.timerSessionsService.getTimerSessionsFromTotalSeconds(totalSeconds);

        return timerSessions[0]?.durationInSec ?? totalSeconds;
    });

    readonly displayedSeconds = computed(() => {
        const remainingTotalSeconds = this.totalSeconds();

        if (!this.currentTimerSession()) {
            return this.firstSessionDurationInSeconds();
        }

        return remainingTotalSeconds > 0
            ? this.timerService.currentTimerSessionRemainingSeconds
            : 0;
    });
    readonly hours = computed(() =>
        this.timeConversionService.totalSecondsToHours(this.displayedSeconds()),
    );
    readonly minutes = computed(() =>
        this.timeConversionService.totalSecondsToMinutes(this.displayedSeconds()),
    );
    readonly seconds = computed(() =>
        this.timeConversionService.totalSecondsToSeconds(this.displayedSeconds()),
    );

    //   TODO: move to a theme service
    protected get currentTimerSessionColor(): CustomIonicColors {
        switch (this.currentTimerSession()?.type) {
            case TimerSessionType.Focus:
                return CustomIonicColors.FocusDarker;

            case TimerSessionType.ShortRest:
            case TimerSessionType.LongRest:
                return CustomIonicColors.RestDarker;

            default:
                return CustomIonicColors.FocusDarker;
        }
    }

    protected get currentTimerSessionText() {
        return this.timerSessionsService.getTimerSessionTypeText(this.currentTimerSession()?.type);
    }
}
