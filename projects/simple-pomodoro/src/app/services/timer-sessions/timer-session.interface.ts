export enum TimerSessionType {
  Focus = 'focus',
  ShortRest = 'short-rest',
  LongRest = 'long-rest',
}

export interface TimerSession {
  durationInSec: number;
  type: TimerSessionType;
}

export type TimerSessionsList = TimerSession[];
