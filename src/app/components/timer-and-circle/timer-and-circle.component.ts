import { IonButton } from '@ionic/angular';

import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { TwoDigitsPipe } from '../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../services/time-conversion/time-conversion.service';
import { TimerService } from '../../services/timer/timer.service';
import { TimerEditComponent } from '../timer-edit/timer-edit.component';
import { CIRCLE } from './circle.constants';

@Component({
  selector: 'app-timer-and-circle',
  templateUrl: './timer-and-circle.component.html',
  styleUrls: ['./timer-and-circle.component.scss'],
  imports: [FormsModule, IonButton, TimerEditComponent, TwoDigitsPipe],
})
export class TimerAndCircleComponent implements OnInit, OnChanges, AfterViewInit {
  private readonly timerService = inject(TimerService);
  private readonly timeConversionService = inject(TimeConversionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = input.required<number>();
  readonly isTimerRunning = input.required<boolean>();

  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));

  isTimerBeingEdited = signal<boolean | null>(null);

  // Circle variables
  private intervalDurationInSec!: ReturnType<typeof this.totalSeconds>;
  private isViewInitialized = false;
  // eslint-disable-next-line angular-class-members-order/angular-class-members-order
  @ViewChild('circleLocalRef') private readonly circleEl!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.timerService.isTimerBeingEdited$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isTimerBeingEdited) => {
      this.isTimerBeingEdited.set(isTimerBeingEdited);
    });

    this.intervalDurationInSec = this.totalSeconds();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.changeCircleProgressBasedOnTimePassedOnInterval();
  }

  ngOnChanges(): void {
    if (!this.isViewInitialized) return;

    this.changeCircleProgressBasedOnTimePassedOnInterval();
  }

  protected onClickEditBtn() {
    this.timerService.starEditingTimer();
  }

  private changeCircleProgressBasedOnTimePassedOnInterval() {
    const currentIntervalDurationRatio = this.getCurrentIntervalDurationRatio();
    const circleProgressFromRatio = this.getCircleDegreesFromRatio(currentIntervalDurationRatio);
    console.log(this.totalSeconds(), this.intervalDurationInSec);
    this.setCircleProgress(circleProgressFromRatio);
  }

  private setCircleProgress(degrees: number) {
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

  private getCurrentIntervalDurationRatio() {
    return this.totalSeconds() / this.intervalDurationInSec;
  }

  private getCircleDegreesFromRatio(ratio: number) {
    return ratio * CIRCLE.maxDegrees;
  }
}
