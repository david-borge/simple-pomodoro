import { IonButton, IonContent, IonHeader } from '@ionic/angular';

import { Component, inject, signal } from '@angular/core';

import { TimerComponent } from '../../components/timer/timer.component';
import { TimerService } from '../../services/timer/timer.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonContent, IonHeader, TimerComponent],
})
export class HomePage {
  private readonly timerService = inject(TimerService);

  readonly totalSeconds = signal(0);

  constructor() {
    this.timerService.totalSeconds$.subscribe((timeInSec) => {
      this.totalSeconds.set(timeInSec);
    });
  }

  onClickStartPauseBtn() {
    this.timerService.startTimer();
  }
}
