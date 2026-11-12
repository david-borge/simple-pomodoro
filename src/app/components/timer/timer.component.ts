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
  SimpleChanges,
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
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [FormsModule, IonButton, TimerEditComponent, TwoDigitsPipe],
})
export class TimerComponent implements OnInit, OnChanges, AfterViewInit {
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
  private readonly intervalDurationInSec!: ReturnType<typeof this.totalSeconds>;
  // eslint-disable-next-line angular-class-members-order/angular-class-members-order
  @ViewChild('circleLocalRef') private readonly circleEl!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.timerService.isTimerBeingEdited$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isTimerBeingEdited) => {
      this.isTimerBeingEdited.set(isTimerBeingEdited);
    });
  }

  protected onClickEditBtn() {
    this.timerService.starEditingTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.setCircleProgress(310);
  }

  ngAfterViewInit(): void {
    this.setCircleProgress(135);
  }

  setCircleProgress(degrees: number) {
    if (degrees < CIRCLE.minDegrees) {
      throw new Error('The degrees for the circle have to be greater than ' + CIRCLE.minDegrees + '.');
    } else if (degrees > CIRCLE.maxDegrees) {
      throw new Error('The degrees for the circle have to be lower than ' + CIRCLE.maxDegrees + '.');
    }

    this.circleEl.nativeElement.style.setProperty('--progress', degrees + 'deg');
  }

  getCurrentIntervalDurationRatio() {
    console.log(this.totalSeconds());
    return this.totalSeconds() / this.intervalDurationInSec;
  }

  getCircleProgressFromRatio(ratio: number) {
    return ratio / CIRCLE.maxDegrees;
  }
}
