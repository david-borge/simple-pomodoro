import { Component, computed, inject, input } from '@angular/core';

import { TwoDigitsPipe } from '../../../pipes/two-digits.pipe';
import { TimeConversionService } from '../../../services/time-conversion/time-conversion.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  imports: [TwoDigitsPipe],
})
export class TimerComponent {
  private readonly timeConversionService = inject(TimeConversionService);

  readonly totalSeconds = input.required<number>();

  readonly hours = computed(() => this.timeConversionService.totalSecondsToHours(this.totalSeconds()));
  readonly minutes = computed(() => this.timeConversionService.totalSecondsToMinutes(this.totalSeconds()));
  readonly seconds = computed(() => this.timeConversionService.totalSecondsToSeconds(this.totalSeconds()));
}
