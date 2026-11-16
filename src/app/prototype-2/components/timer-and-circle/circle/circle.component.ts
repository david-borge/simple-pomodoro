import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { ONE_SECOND_IN_MILIISECONDS } from '../../../constants/time-conversion.constants';
import { TimerSession, TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';
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

  readonly totalSeconds = input.required<number>();
  readonly isTimerBeingEdited = input.required<boolean>();
  readonly isTimerRunning = input.required<boolean | null>();
  readonly isTimerPaused = input.required<boolean | null>();
  readonly isTimerCancelled = input.required<boolean | null>();
  readonly currentTimerSession = input.required<TimerSession | null>();

  private intervalDurationInSec!: ReturnType<typeof this.totalSeconds>;
  private isViewInitialized = false;
  private progressShadowFrameId: number | null = null;
  // eslint-disable-next-line angular-class-members-order/angular-class-members-order
  @ViewChild('circleLocalRef') private readonly circleEl!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.intervalDurationInSec = this.totalSeconds();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.changeCircleProgressBasedOnTimePassedOnInterval();
  }

  ngOnDestroy(): void {
    this.cancelProgressShadowCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isViewInitialized) return;

    if (changes['isTimerPaused']?.currentValue === true) {
      this.freezeCircleProgressAtCurrentPosition();
      this.cancelProgressShadowCheck();
      return;
    }

    if (changes['isTimerRunning']?.currentValue === true) {
      this.circleEl.nativeElement.classList.add('is-running');
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
      this.setCircleProgressResetDuration();
      this.changeCircleProgressBasedOnTimePassedOnInterval();
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
    const circleProgressFromRatio = this.getCircleDegreesFromRatio(currentIntervalDurationRatio);
    this.setCircleProgress(circleProgressFromRatio);
    this.setProgressShadowVisible(
      circleProgressFromRatio <= CircleDegrees.maxDegrees - CircleComponent.PROGRESS_SHADOW_START_OFFSET_IN_DEGREES,
    );

    if (this.isTimerRunning() === true) this.updateProgressShadowVisibility();
  }

  private updateProgressShadowVisibility(): void {
    this.cancelProgressShadowCheck();

    const shadowStartAngle = CircleDegrees.maxDegrees - CircleComponent.PROGRESS_SHADOW_START_OFFSET_IN_DEGREES;

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

    this.circleEl.nativeElement.style.setProperty('--progress', degrees + 'deg');
  }

  private freezeCircleProgressAtCurrentPosition(): void {
    const currentProgress = getComputedStyle(this.circleEl.nativeElement).getPropertyValue('--progress').trim();
    this.circleEl.nativeElement.style.setProperty('--progress', currentProgress);
  }

  private setCircleProgressResetDuration(): void {
    const currentProgress = Number.parseFloat(
      getComputedStyle(this.circleEl.nativeElement).getPropertyValue('--progress'),
    );

    if (!Number.isFinite(currentProgress)) return;

    const remainingProgressRatio = Math.min(
      Math.max((CircleDegrees.maxDegrees - currentProgress) / CircleDegrees.maxDegrees, 0),
      1,
    );
    const resetDurationRatio = Math.max(remainingProgressRatio, CircleComponent.MIN_CIRCLE_RESET_DURATION_RATIO);
    const resetDurationInMs = resetDurationRatio * ONE_SECOND_IN_MILIISECONDS;

    this.circleEl.nativeElement.style.setProperty('--circle-progress-reset-duration', `${resetDurationInMs}ms`);
  }

  private animateCircleProgressToNextSecond(): void {
    const totalSecondsAfterNextTick = Math.max(this.totalSeconds() - 1, 0);
    const progressRatio = totalSecondsAfterNextTick / this.intervalDurationInSec;
    this.setCircleProgress(this.getCircleDegreesFromRatio(progressRatio));
  }

  private getCurrentIntervalDurationRatio(): number {
    return this.totalSeconds() / this.intervalDurationInSec;
  }

  private getCircleDegreesFromRatio(ratio: number): number {
    return ratio * CircleDegrees.maxDegrees;
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
