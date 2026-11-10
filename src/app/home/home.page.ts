import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
})
export class HomePage {
  constructor() {}
}
