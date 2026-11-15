import { IonChip } from '@ionic/angular';

import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CustomIonicColors } from '../../design-system/ionic-colors';
import { TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';
import { TimerService } from '../../services/timer/timer.service';
import { TimerEditComponent } from '../timer-edit/timer-edit.component';
import { CircleComponent } from './circle/circle.component';
import { EditButtonComponent } from './edit-button/edit-button.component';
import { TimerComponent } from './timer/timer.component';

@Component({
  selector: 'app-timer-and-circle',
  templateUrl: './timer-and-circle.component.html',
  styleUrls: ['./timer-and-circle.component.scss'],
  imports: [CircleComponent, EditButtonComponent, IonChip, TimerComponent, TimerEditComponent],
})
export class TimerAndCircleComponent implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly timerSessionsService = inject(TimerSessionsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSeconds = input.required<number>();

  isTimerBeingEdited = signal<boolean | null>(null);
  currentTimerSessionText = signal<string | null>(null);
  currentTimerSessionType = signal<TimerSessionType | undefined>(undefined);

  ngOnInit() {
    this.timerService.timerStatus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ isTimerBeingEdited }) => {
      this.isTimerBeingEdited.set(isTimerBeingEdited);
    });

    this.timerService.currentTimerSession$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentTimerSession) => {
        this.currentTimerSessionText.set(this.timerSessionsService.getTimerSessionTypeText(currentTimerSession?.type));
        this.currentTimerSessionType.set(currentTimerSession?.type);
      });
  }

  protected get sessionTypeIonChipColor(): CustomIonicColors {
    switch (this.currentTimerSessionType()) {
      case TimerSessionType.Focus:
        return CustomIonicColors.Focus;

      case TimerSessionType.ShortRest:
      case TimerSessionType.LongRest:
        return CustomIonicColors.Rest;

      default:
        return CustomIonicColors.Focus;
    }
  }
}
