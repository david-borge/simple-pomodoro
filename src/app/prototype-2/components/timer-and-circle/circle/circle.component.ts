import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { TimerSession, TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';
import { CircleColorClass } from './circle-color-class.enum';
import { CircleDegrees } from './circle-degrees.constant';

@Component({
  selector: 'app-circle',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss'],
})
export class CircleComponent implements OnInit, OnChanges, AfterViewInit {
  readonly totalSeconds = input.required<number>();
  readonly isTimerBeingEdited = input.required<boolean>();
  readonly isTimerRunning = input.required<boolean | null>();
  readonly isTimerPaused = input.required<boolean | null>();
  readonly isTimerCancelled = input.required<boolean | null>();
  readonly currentTimerSession = input.required<TimerSession | null>();

  private intervalDurationInSec!: ReturnType<typeof this.totalSeconds>;
  private isViewInitialized = false;
  // eslint-disable-next-line angular-class-members-order/angular-class-members-order
  @ViewChild('circleLocalRef') private readonly circleEl!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.intervalDurationInSec = this.totalSeconds();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.changeCircleProgressBasedOnTimePassedOnInterval();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isViewInitialized) return;

    if (changes['isTimerPaused']?.currentValue === true) {
      this.freezeCircleProgressAtCurrentPosition();
      return;
    }

    if (changes['isTimerRunning']?.currentValue === true) {
      this.circleEl.nativeElement.classList.add('is-running');
      this.animateCircleProgressToNextSecond();
      return;
    }

    if (this.isTimerBeingEdited()) {
      this.intervalDurationInSec = this.totalSeconds();
      return;
    }

    if (changes['totalSeconds'] && this.isTimerRunning() === true) {
      this.animateCircleProgressToNextSecond();
      return;
    }

    if (
      changes['totalSeconds'] ||
      changes['isTimerCancelled']?.currentValue === true ||
      changes['isTimerBeingEdited']?.currentValue === false
    ) {
      this.changeCircleProgressBasedOnTimePassedOnInterval();
    }
  }

  private changeCircleProgressBasedOnTimePassedOnInterval(): void {
    const currentIntervalDurationRatio = this.getCurrentIntervalDurationRatio();
    const circleProgressFromRatio = this.getCircleDegreesFromRatio(currentIntervalDurationRatio);
    this.setCircleProgress(circleProgressFromRatio);
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
