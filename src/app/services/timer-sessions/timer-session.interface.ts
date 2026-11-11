export enum TimerSessionType {
  Focus = 'focus',
  ShortRest = 'short-rest',
  LongRest = 'long-rest',
}

interface TimerSession {
  durationInMs: number;
  type: TimerSessionType;
}

export type TimerSessionsList = TimerSession[];
