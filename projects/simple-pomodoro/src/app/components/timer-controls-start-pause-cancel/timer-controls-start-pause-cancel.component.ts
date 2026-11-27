import { IonButton } from '@ionic/angular';

import {
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CustomIonicColors, IonicColors } from '../../design-system/ionic-colors';
import { IonicFocusService } from '../../services/ionic-focus/ionic-focus.service';
import { TimerService } from '../../services/timer/timer.service';
import {
    TimerSession,
    TimerSessionType,
} from '../../services/timer-sessions/timer-session.interface';

@Component({
    selector: 'app-timer-controls-start-pause-cancel',
    templateUrl: './timer-controls-start-pause-cancel.component.html',
    styleUrls: ['./timer-controls-start-pause-cancel.component.scss'],
    imports: [IonButton],
})
export class TimerControlsStartPauseCancelComponent {
    private readonly ionicFocusService = inject(IonicFocusService);
    private readonly timerService = inject(TimerService);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild('startPauseButton', { read: ElementRef })
    private startPauseButton!: ElementRef<HTMLIonButtonElement>;

    readonly isReady = input(false);

    readonly isTimerPaused = signal(this.timerService.isTimerPaused);
    readonly isCircleResetting = signal(this.timerService.isCircleResetting);
    private currentTimerSession = signal<TimerSession | null>(null);

    constructor() {
        effect(() => {
            if (this.isReady()) {
                this.ionicFocusService.focusIonButton(this.startPauseButton.nativeElement);
            }
        });

        this.timerService.timerStatus$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ isTimerPaused }) => {
                this.isTimerPaused.set(isTimerPaused);
            });

        this.timerService.isCircleResetting$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((isCircleResetting) => {
                this.isCircleResetting.set(isCircleResetting);
            });

        this.timerService.currentTimerSession$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((currentTimerSession) => {
                this.currentTimerSession.set(currentTimerSession);
            });
    }

    onClickStartPauseBtn() {
        if (this.timerService.isTimerRunning) {
            this.timerService.pauseTimer();
            return;
        }

        this.timerService.startTimer();
    }

    onClickCancelBtn() {
        this.timerService.cancelTimer();
    }

    startPauseBtnColor(): IonicColors {
        if (this.currentTimerSession()?.type === TimerSessionType.Focus && this.isTimerPaused()) {
            return CustomIonicColors.Focus;
        } else if (
            this.currentTimerSession()?.type === TimerSessionType.Focus &&
            !this.isTimerPaused()
        ) {
            return CustomIonicColors.FocusLighter;
        } else if (
            (this.currentTimerSession()?.type === TimerSessionType.ShortRest ||
                this.currentTimerSession()?.type === TimerSessionType.LongRest) &&
            this.isTimerPaused()
        ) {
            return CustomIonicColors.Rest;
        } else if (
            (this.currentTimerSession()?.type === TimerSessionType.ShortRest ||
                this.currentTimerSession()?.type === TimerSessionType.LongRest) &&
            !this.isTimerPaused()
        ) {
            return CustomIonicColors.RestLighter;
        } else {
            return CustomIonicColors.Focus;
        }
    }

    startPauseBtnText(): string {
        if (!this.timerService.isTimerRunning && this.timerService.isTimerCancelled) {
            return 'Start';
        } else if (!this.timerService.isTimerRunning && !this.timerService.isTimerCancelled) {
            return 'Continue';
        } else {
            return 'Pause';
        }
    }
}
