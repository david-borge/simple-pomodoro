import { AfterViewInit, Component, ElementRef, input, OnChanges, OnInit, ViewChild } from '@angular/core';

import { CIRCLE } from './circle.constants';

@Component({
  selector: 'app-circle',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss'],
})
export class CircleComponent implements OnInit, OnChanges, AfterViewInit {
  readonly totalSeconds = input.required<number>();
  readonly isTimerBeingEdited = input.required<boolean>();

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

  ngOnChanges(): void {
    if (!this.isViewInitialized) return;

    if (this.isTimerBeingEdited()) {
      this.intervalDurationInSec = this.totalSeconds();
      return;
    }

    this.changeCircleProgressBasedOnTimePassedOnInterval();
  }

  private changeCircleProgressBasedOnTimePassedOnInterval(): void {
    const currentIntervalDurationRatio = this.getCurrentIntervalDurationRatio();
    const circleProgressFromRatio = this.getCircleDegreesFromRatio(currentIntervalDurationRatio);
    this.setCircleProgress(circleProgressFromRatio);
  }

  private setCircleProgress(degrees: number): void {
    if (degrees < CIRCLE.minDegrees) {
      throw new Error(
        'The degrees for the circle have to be greater than ' +
          CIRCLE.minDegrees +
          '. Current value: ' +
          degrees +
          'deg.',
      );
    } else if (degrees > CIRCLE.maxDegrees) {
      throw new Error(
        'The degrees for the circle have to be lower than ' +
          CIRCLE.maxDegrees +
          '. Current value: ' +
          degrees +
          'deg.',
      );
    }

    this.circleEl.nativeElement.style.setProperty('--progress', degrees + 'deg');
  }

  private getCurrentIntervalDurationRatio(): number {
    return this.totalSeconds() / this.intervalDurationInSec;
  }

  private getCircleDegreesFromRatio(ratio: number): number {
    return ratio * CIRCLE.maxDegrees;
  }
}
