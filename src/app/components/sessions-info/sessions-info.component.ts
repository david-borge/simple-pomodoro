import { Component, ElementRef, inject, input, OnInit, Renderer2, signal } from '@angular/core';

import { TimerSessionsList, TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { TimerSessionsService } from '../../services/timer-sessions/timer-sessions.service';
import { BulletComponent } from './bullet/bullet.component';

@Component({
  selector: 'app-sessions-info',
  templateUrl: './sessions-info.component.html',
  styleUrls: ['./sessions-info.component.scss'],
  imports: [BulletComponent],
})
export class SessionsInfoComponent implements OnInit {
  private readonly timerSessionsService = inject(TimerSessionsService);
  private readonly renderer = inject(Renderer2);
  private readonly el = inject(ElementRef);

  readonly totalSeconds = input.required<number>();

  private timerSessionsList = signal<TimerSessionsList>([]);

  numberOfFocusSessions = signal<number | null>(null);
  numberOfShortRestSessions = signal<number | null>(null);
  numberOfLongRestSessions = signal<number | null>(null);
  numberOfTotalRestSessions = signal<number | null>(null);

  TimerSessionType = TimerSessionType;

  ngOnInit(): void {
    this.timerSessionsList.set(this.timerSessionsService.getTimerSessionsFromTotalSeconds(2 * 60 * 60));
    // this.timerSessionsList.set(this.timerSessionsService.getTimerSessionsFromTotalSeconds(this.totalSeconds()));

    this.numberOfFocusSessions.set(
      this.timerSessionsService.getNumberOfSessionsOfAParticulaType(this.timerSessionsList(), TimerSessionType.Focus),
    );

    this.numberOfShortRestSessions.set(
      this.timerSessionsService.getNumberOfSessionsOfAParticulaType(
        this.timerSessionsList(),
        TimerSessionType.ShortRest,
      ),
    );

    this.numberOfLongRestSessions.set(
      this.timerSessionsService.getNumberOfSessionsOfAParticulaType(
        this.timerSessionsList(),
        TimerSessionType.LongRest,
      ),
    );

    const numberOfFocusSessions = this.numberOfFocusSessions();
    const numberOfShortRestSessions = this.numberOfShortRestSessions();
    const numberOfLongRestSessions = this.numberOfLongRestSessions();

    if (numberOfShortRestSessions !== null && numberOfLongRestSessions !== null) {
      this.numberOfTotalRestSessions.set(numberOfShortRestSessions + numberOfLongRestSessions);
    }

    if (numberOfFocusSessions && numberOfFocusSessions > 1) {
      this.setSessionsInfoHtml();
    }
  }

  setSessionsInfoHtml() {
    const numberOfFocusSessions = this.numberOfFocusSessions();
    const numberOfShortRestSessions = this.numberOfShortRestSessions();
    const numberOfLongRestSessions = this.numberOfLongRestSessions();

    // "You'll have 3 focus sessions and 2 rests."
    const paragraphEl: HTMLParagraphElement = this.renderer.createElement('p');

    const initialText = this.renderer.createText("You'll have ");
    this.renderer.appendChild(paragraphEl, initialText);

    const focusSessionsNumberSpanEl: HTMLSpanElement = this.renderer.createElement('span');
    if (numberOfFocusSessions !== null) {
      const focusSessionsNumberText = this.renderer.createText(numberOfFocusSessions.toString());
      this.renderer.appendChild(focusSessionsNumberSpanEl, focusSessionsNumberText);
      focusSessionsNumberSpanEl.classList.add('text-focus-color');
      focusSessionsNumberSpanEl.style.fontWeight = 'bold';
      this.renderer.appendChild(paragraphEl, focusSessionsNumberSpanEl);
    }

    const focusSessionsTextSpanEl: HTMLSpanElement = this.renderer.createElement('span');
    const focusSessionsText = this.renderer.createText(' focus sessions');
    this.renderer.appendChild(focusSessionsTextSpanEl, focusSessionsText);
    focusSessionsTextSpanEl.classList.add('text-focus-color');
    this.renderer.appendChild(paragraphEl, focusSessionsTextSpanEl);

    if (
      numberOfFocusSessions !== null &&
      numberOfShortRestSessions !== null &&
      numberOfLongRestSessions !== null &&
      numberOfShortRestSessions > 0 &&
      numberOfLongRestSessions > 0
    ) {
      const restSessionsInitialText = this.renderer.createText(' and ');
      this.renderer.appendChild(paragraphEl, restSessionsInitialText);

      const restSessionsNumberSpanEl: HTMLSpanElement = this.renderer.createElement('span');

      const numberOfTotalRestSessions = numberOfShortRestSessions + numberOfLongRestSessions;
      const restSessionsNumberText = this.renderer.createText(numberOfTotalRestSessions.toString());
      this.renderer.appendChild(restSessionsNumberSpanEl, restSessionsNumberText);

      restSessionsNumberSpanEl.classList.add('text-rest-color');
      restSessionsNumberSpanEl.style.fontWeight = 'bold';
      this.renderer.appendChild(paragraphEl, restSessionsNumberSpanEl);

      const restSessionsEndingTextSpanEl: HTMLSpanElement = this.renderer.createElement('span');
      const restSessionsEndingText = this.renderer.createText(' rests');
      this.renderer.appendChild(restSessionsEndingTextSpanEl, restSessionsEndingText);
      restSessionsEndingTextSpanEl.classList.add('text-rest-color');
      this.renderer.appendChild(paragraphEl, restSessionsEndingTextSpanEl);
    }

    const periodText = this.renderer.createText('.');
    this.renderer.appendChild(paragraphEl, periodText);

    const targetElement: HTMLDivElement =
      this.el.nativeElement.querySelector('#timer-sessions-info-text') ||
      document.getElementById('timer-sessions-info-text');

    targetElement.classList.add('ion-text-center');

    this.renderer.appendChild(targetElement, paragraphEl);
  }
}
