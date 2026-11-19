import { Injectable } from '@angular/core';

import { InjectionScopes } from '../../constants/injection-scopes.constant';
import { ONE_MINUTE_IN_SECONDS, SECONDS_PER_HOUR } from '../../constants/time-conversion.constants';

@Injectable({ providedIn: InjectionScopes.ROOT })
export class TimeConversionService {
  public totalSecondsToHours(totalSeconds: number): number {
    const normalizedSeconds = this.normalizeTimeInSec(totalSeconds);

    return Math.floor(normalizedSeconds / SECONDS_PER_HOUR);
  }

  public totalSecondsToMinutes(totalSeconds: number): number {
    const normalizedSeconds = this.normalizeTimeInSec(totalSeconds);

    return Math.floor((normalizedSeconds % SECONDS_PER_HOUR) / ONE_MINUTE_IN_SECONDS);
  }

  public totalSecondsToSeconds(totalSeconds: number): number {
    const normalizedSeconds = this.normalizeTimeInSec(totalSeconds);

    return normalizedSeconds % ONE_MINUTE_IN_SECONDS;
  }

  private normalizeTimeInSec(timeInSec: number): number {
    return Number.isFinite(timeInSec) ? Math.max(0, Math.floor(timeInSec)) : 0;
  }
}
