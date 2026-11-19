import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core';

import { ONE_SECOND_IN_MILIISECONDS } from '../../../constants/time-conversion.constants';
import {
    TimerSession,
    TimerSessionType,
} from '../../../services/timer-sessions/timer-session.interface';
import { TimerService } from '../../../services/timer/timer.service';
import { CircleColorClass } from './circle-color-class.enum';
import { CircleDegrees } from './circle-degrees.constant';

@Component({
    selector: 'app-circle',
    templateUrl: './circle.component.html',
    styleUrls: ['./circle.component.scss'],
})
export class CircleComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    private static readonly MIN_CIRCLE_RESET_DURATION_RATIO = 0.2;
    private static readonly PROGRESS_SHADOW_START_OFFSET_IN_DEGREES = 3;

    private readonly timerService = inject(TimerService);

    readonly totalSeconds = input.required<number>();
    readonly isTimerBeingEdited = input.required<boolean>();
    readonly isTimerRunning = input.required<boolean | null>();
    readonly isTimerPaused = input.required<boolean | null>();
    readonly isTimerCancelled = input.required<boolean | null>();
    readonly currentTimerSession = input.required<TimerSession | null>();

    private intervalDurationInSec!: ReturnType<typeof this.totalSeconds>;
    private isViewInitialized = false;
    private progressShadowFrameId: number | null = null;
    private progressGeometryResizeObserver: ResizeObserver | null = null;
    private circleResetTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private progressSweepMaxDegrees = CircleDegrees.maxDegrees;
    private isProgressGeometryInitialized = false;
    // eslint-disable-next-line angular-class-members-order/angular-class-members-order
    @ViewChild('circleLocalRef') private readonly circleEl!: ElementRef<HTMLDivElement>;

    ngOnInit(): void {
        this.intervalDurationInSec =
            this.currentTimerSession()?.durationInSec ?? this.totalSeconds();
    }

    ngAfterViewInit(): void {
        this.isViewInitialized = true;
        this.updateCircleProgressGeometry();

        if (typeof ResizeObserver !== 'undefined') {
            this.progressGeometryResizeObserver = new ResizeObserver(() =>
                this.updateCircleProgressGeometry(),
            );
            this.progressGeometryResizeObserver.observe(this.circleEl.nativeElement);
        }

        this.changeCircleProgressBasedOnTimePassedOnInterval();
    }

    ngOnDestroy(): void {
        this.cancelProgressShadowCheck();
        this.cancelCircleResetCompletion();
        this.timerService.completeCircleReset();
        this.progressGeometryResizeObserver?.disconnect();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isViewInitialized) return;

        if (changes['currentTimerSession']) {
            this.intervalDurationInSec =
                this.currentTimerSession()?.durationInSec ?? this.totalSeconds();
        }

        if (changes['isTimerPaused']?.currentValue === true) {
            this.freezeCircleProgressAtCurrentPosition();
            this.cancelProgressShadowCheck();
            return;
        }

        if (changes['isTimerRunning']?.currentValue === true) {
            this.circleEl.nativeElement.classList.add('is-running');
            this.circleEl.nativeElement.classList.remove('is-resetting');
            this.animateCircleProgressToNextSecond();
            this.updateProgressShadowVisibility();
            return;
        }

        if (this.isTimerBeingEdited()) {
            this.intervalDurationInSec = this.totalSeconds();
            this.resetProgressShadowVisibility();
            return;
        }

        if (changes['isTimerCancelled']?.currentValue === true) {
            this.circleEl.nativeElement.classList.add('is-resetting');
            const resetDurationInMs = this.setCircleProgressResetDuration();
            this.changeCircleProgressBasedOnTimePassedOnInterval();
            this.scheduleCircleResetCompletion(resetDurationInMs);
            this.resetProgressShadowVisibility();
            return;
        }

        if (changes['totalSeconds'] && this.isTimerRunning() === true) {
            this.animateCircleProgressToNextSecond();
            this.updateProgressShadowVisibility();
            return;
        }

        if (changes['totalSeconds'] || changes['isTimerBeingEdited']?.currentValue === false) {
            this.changeCircleProgressBasedOnTimePassedOnInterval();
        }
    }

    private changeCircleProgressBasedOnTimePassedOnInterval(): void {
        const currentIntervalDurationRatio = this.getCurrentIntervalDurationRatio();
        const circleProgressFromRatio = this.getCircleDegreesFromRatio(
            currentIntervalDurationRatio,
        );
        this.setCircleProgress(circleProgressFromRatio);
        this.setProgressShadowVisible(
            circleProgressFromRatio <=
                CircleDegrees.maxDegrees - CircleComponent.PROGRESS_SHADOW_START_OFFSET_IN_DEGREES,
        );

        if (this.isTimerRunning() === true) this.updateProgressShadowVisibility();
    }

    private updateProgressShadowVisibility(): void {
        this.cancelProgressShadowCheck();

        const shadowStartAngle = this.getCircleProgressAngleFromDegrees(
            CircleDegrees.maxDegrees - CircleComponent.PROGRESS_SHADOW_START_OFFSET_IN_DEGREES,
        );

        if (this.isTimerRunning() !== true) return;

        const checkForShadowStart = (): void => {
            this.progressShadowFrameId = null;

            if (this.isTimerRunning() !== true) return;

            const currentProgress = Number.parseFloat(
                getComputedStyle(this.circleEl.nativeElement).getPropertyValue('--progress'),
            );

            if (!Number.isFinite(currentProgress)) return;

            if (currentProgress <= shadowStartAngle) {
                this.setProgressShadowVisible(true);
                return;
            }

            this.setProgressShadowVisible(false);
            this.progressShadowFrameId = requestAnimationFrame(checkForShadowStart);
        };

        this.progressShadowFrameId = requestAnimationFrame(checkForShadowStart);
    }

    private setProgressShadowVisible(isVisible: boolean): void {
        this.circleEl.nativeElement.classList.toggle('has-progress-shadow', isVisible);
    }

    private cancelProgressShadowCheck(): void {
        if (this.progressShadowFrameId === null) return;

        cancelAnimationFrame(this.progressShadowFrameId);
        this.progressShadowFrameId = null;
    }

    private resetProgressShadowVisibility(): void {
        this.cancelProgressShadowCheck();
        this.setProgressShadowVisible(false);
    }

    private setCircleProgress(degrees: number): void {
        if (degrees < CircleDegrees.minDegrees) {
            throw new Error(
                'The degrees for the circle have to be greater than ' +
                    CircleDegrees.minDegrees +
                    '. Current value: ' +
                    degrees +
                    'deg.',
            );
        } else if (degrees > CircleDegrees.maxDegrees) {
            throw new Error(
                'The degrees for the circle have to be lower than ' +
                    CircleDegrees.maxDegrees +
                    '. Current value: ' +
                    degrees +
                    'deg.',
            );
        }

        this.circleEl.nativeElement.style.setProperty(
            '--progress',
            this.getCircleProgressAngleFromDegrees(degrees) + 'deg',
        );
    }

    private updateCircleProgressGeometry(): void {
        const circleElement = this.circleEl.nativeElement;
        const circleDiameter = circleElement.getBoundingClientRect().width;
        const borderWidth = Number.parseFloat(
            getComputedStyle(circleElement).getPropertyValue('--circle-border-width'),
        );
        const centerlineDiameter = circleDiameter - borderWidth;

        if (circleDiameter <= 0 || borderWidth <= 0 || centerlineDiameter <= 0) return;

        const halfCapAngleInRadians = Math.asin(Math.min(borderWidth / centerlineDiameter, 1));
        const halfCapAngleInDegrees = (halfCapAngleInRadians * 180) / Math.PI;
        // Reserve the caps' angular width so their tips meet at the top at full progress.
        const newProgressSweepMaxDegrees = CircleDegrees.maxDegrees - halfCapAngleInDegrees * 2;

        if (
            this.isProgressGeometryInitialized &&
            Math.abs(newProgressSweepMaxDegrees - this.progressSweepMaxDegrees) < 0.01
        ) {
            return;
        }

        const currentProgress = Number.parseFloat(
            getComputedStyle(circleElement).getPropertyValue('--progress'),
        );
        const currentProgressRatio = Number.isFinite(currentProgress)
            ? Math.min(
                  Math.max(
                      (currentProgress + CircleDegrees.maxDegrees - this.progressSweepMaxDegrees) /
                          CircleDegrees.maxDegrees,
                      0,
                  ),
                  1,
              )
            : 0;

        this.progressSweepMaxDegrees = newProgressSweepMaxDegrees;
        circleElement.style.setProperty(
            '--circle-progress-start-angle',
            `${halfCapAngleInDegrees}deg`,
        );
        this.isProgressGeometryInitialized = true;

        if (this.isViewInitialized) {
            this.setCircleProgress(currentProgressRatio * CircleDegrees.maxDegrees);
        }
    }

    private freezeCircleProgressAtCurrentPosition(): void {
        const currentProgress = getComputedStyle(this.circleEl.nativeElement)
            .getPropertyValue('--progress')
            .trim();
        this.circleEl.nativeElement.style.setProperty('--progress', currentProgress);
    }

    private setCircleProgressResetDuration(): number {
        const currentProgress = Number.parseFloat(
            getComputedStyle(this.circleEl.nativeElement).getPropertyValue('--progress'),
        );

        if (!Number.isFinite(currentProgress)) return ONE_SECOND_IN_MILIISECONDS;

        const remainingProgressRatio = Math.min(
            Math.max(
                (this.progressSweepMaxDegrees - currentProgress) / CircleDegrees.maxDegrees,
                0,
            ),
            1,
        );
        const resetDurationRatio = Math.max(
            remainingProgressRatio,
            CircleComponent.MIN_CIRCLE_RESET_DURATION_RATIO,
        );
        const resetDurationInMs = resetDurationRatio * ONE_SECOND_IN_MILIISECONDS;

        this.circleEl.nativeElement.style.setProperty(
            '--circle-progress-reset-duration',
            `${resetDurationInMs}ms`,
        );
        return resetDurationInMs;
    }

    private scheduleCircleResetCompletion(durationInMs: number): void {
        this.cancelCircleResetCompletion();
        this.circleResetTimeoutId = setTimeout(() => {
            this.completeCircleReset();
        }, durationInMs + 50);
    }

    onCircleTransitionEnd(event: TransitionEvent): void {
        if (event.target !== this.circleEl.nativeElement || event.propertyName !== '--progress')
            return;

        this.completeCircleReset();
    }

    private completeCircleReset(): void {
        this.cancelCircleResetCompletion();
        this.timerService.completeCircleReset();
    }

    private cancelCircleResetCompletion(): void {
        if (this.circleResetTimeoutId === null) return;

        clearTimeout(this.circleResetTimeoutId);
        this.circleResetTimeoutId = null;
    }

    private animateCircleProgressToNextSecond(): void {
        const currentSessionSecondsAfterNextTick = Math.max(
            this.getCurrentIntervalRemainingSeconds() - 1,
            0,
        );
        const progressRatio = currentSessionSecondsAfterNextTick / this.intervalDurationInSec;
        this.setCircleProgress(this.getCircleDegreesFromRatio(progressRatio));
    }

    private getCurrentIntervalDurationRatio(): number {
        return this.getCurrentIntervalRemainingSeconds() / this.intervalDurationInSec;
    }

    private getCurrentIntervalRemainingSeconds(): number {
        return this.currentTimerSession()
            ? this.timerService.currentTimerSessionRemainingSeconds
            : this.totalSeconds();
    }

    private getCircleDegreesFromRatio(ratio: number): number {
        return ratio * CircleDegrees.maxDegrees;
    }

    private getCircleProgressAngleFromDegrees(degrees: number): number {
        // The requested degrees include the rounded caps; only the remainder is the conic arc.
        const capAngularWidth = CircleDegrees.maxDegrees - this.progressSweepMaxDegrees;
        return Math.max(degrees - capAngularWidth, 0);
    }

    protected get circleColor(): string {
        switch (this.currentTimerSession()?.type) {
            case TimerSessionType.Focus:
                return CircleColorClass.Focus;

            case TimerSessionType.ShortRest:
            case TimerSessionType.LongRest:
                return CircleColorClass.Rest;

            default:
                return CircleColorClass.Focus;
        }
    }
}
