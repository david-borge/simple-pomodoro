import { IonButton, IonContent, IonHeader } from '@ionic/angular';

import { Component } from '@angular/core';

import { TimerComponent } from '../../components/timer/timer.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonContent, IonHeader, TimerComponent],
})
export class HomePage {
  onClickStartPauseBtn() {
    throw new Error('Method not implemented.');
  }
}
