import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  inject,
  Renderer2,
  Service,
} from '@angular/core';

import { TimerSessionType } from '../../services/timer-sessions/timer-session.interface';
import { OutlinedNumberComponent } from './outlined-number/outlined-number.component';

/**
 * Presenter service handling imperative DOM creation and styling.
 * Satisfies SRP and OCP by isolating DOM manipulation from component business logic.
 */
@Service()
export class SessionsInfoService {
  private readonly applicationRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly outlinedNumberComponentRefs: ComponentRef<OutlinedNumberComponent>[] = [];

  renderSessionsInfo(
    el: ElementRef,
    renderer: Renderer2,
    focusSessions: number | null,
    shortRests: number | null,
    longRests: number | null,
    isTimerRunning: boolean,
  ): void {
    const targetElement = this.getTargetElement(el);

    if (!targetElement) return;

    if (focusSessions === null) {
      this.clearSessionsInfo(targetElement, renderer);
      return;
    }

    this.clearSessionsInfo(targetElement, renderer);

    const paragraphEl = this.createSessionsInfoParagraph(
      renderer,
      focusSessions,
      shortRests,
      longRests,
      isTimerRunning,
    );
    renderer.appendChild(targetElement, paragraphEl);
  }

  private getTargetElement(el: ElementRef): Element | null {
    return (
      el.nativeElement.querySelector('#timer-sessions-info-text') || document.getElementById('timer-sessions-info-text')
    );
  }

  private clearSessionsInfo(targetElement: Element, renderer: Renderer2): void {
    this.destroyOutlinedNumberComponents();

    const existingInfo = targetElement.querySelector('#timer-sessions-info-dynamic');
    if (existingInfo) renderer.removeChild(targetElement, existingInfo);
  }

  public destroyOutlinedNumberComponents(): void {
    this.outlinedNumberComponentRefs.forEach((componentRef) => {
      this.applicationRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });
    this.outlinedNumberComponentRefs.length = 0;
  }

  private createSessionsInfoParagraph(
    renderer: Renderer2,
    focusSessions: number,
    shortRests: number | null,
    longRests: number | null,
    isTimerRunning: boolean,
  ): HTMLParagraphElement {
    const paragraphEl: HTMLParagraphElement = renderer.createElement('p');
    paragraphEl.style.setProperty('margin-bottom', '0');
    renderer.setAttribute(paragraphEl, 'id', 'timer-sessions-info-dynamic');

    this.appendInitialText(paragraphEl, renderer, isTimerRunning);
    const focusSessionsGroup = this.appendFocusSessions(paragraphEl, renderer, focusSessions);
    const restSessionsGroup = this.appendRestSessions(paragraphEl, renderer, shortRests, longRests);

    this.appendFinalText(restSessionsGroup ?? focusSessionsGroup, renderer, isTimerRunning);
    return paragraphEl;
  }

  private appendInitialText(paragraphEl: HTMLParagraphElement, renderer: Renderer2, isTimerRunning: boolean): void {
    renderer.appendChild(paragraphEl, renderer.createText(isTimerRunning ? 'You have ' : "You'll have "));
  }

  private appendFinalText(group: HTMLSpanElement, renderer: Renderer2, isTimerRunning: boolean): void {
    renderer.appendChild(group, renderer.createText(isTimerRunning ? ' left.' : '.'));
  }

  private appendFocusSessions(
    paragraphEl: HTMLParagraphElement,
    renderer: Renderer2,
    focusSessions: number,
  ): HTMLSpanElement {
    return this.appendNumberAndLabel(
      paragraphEl,
      renderer,
      focusSessions,
      TimerSessionType.Focus,
      focusSessions === 1 ? ' focus session' : ' focus sessions',
      'text-focus-color',
    );
  }

  private appendRestSessions(
    paragraphEl: HTMLParagraphElement,
    renderer: Renderer2,
    shortRests: number | null,
    longRests: number | null,
  ): HTMLSpanElement | null {
    if (shortRests === null || longRests === null) return null;

    const totalRests = shortRests + longRests;
    if (totalRests < 1) return null;

    renderer.appendChild(paragraphEl, renderer.createText(' '));
    return this.appendNumberAndLabel(
      paragraphEl,
      renderer,
      totalRests,
      TimerSessionType.ShortRest,
      totalRests === 1 ? ' rest' : ' rests',
      'text-rest-color',
      'and ',
    );
  }

  private appendNumberAndLabel(
    paragraphEl: HTMLParagraphElement,
    renderer: Renderer2,
    number: number,
    sessionType: TimerSessionType,
    label: string,
    labelClass: string,
    prefix = '',
  ): HTMLSpanElement {
    const group: HTMLSpanElement = renderer.createElement('span');
    renderer.setStyle(group, 'white-space', 'nowrap');
    if (prefix) renderer.appendChild(group, renderer.createText(prefix));
    this.appendOutlinedNumber(group, renderer, number, sessionType);
    renderer.appendChild(group, this.createSpan(renderer, label, labelClass, true));
    renderer.appendChild(paragraphEl, group);
    return group;
  }

  private appendOutlinedNumber(
    parentElement: HTMLElement,
    renderer: Renderer2,
    number: number,
    sessionType: TimerSessionType,
  ): void {
    const hostElement = renderer.createElement('app-outlined-number') as HTMLElement;
    const componentRef = createComponent(OutlinedNumberComponent, {
      environmentInjector: this.environmentInjector,
      hostElement,
    });

    componentRef.setInput('number', number);
    componentRef.setInput('sessionType', sessionType);
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
    this.outlinedNumberComponentRefs.push(componentRef);
    renderer.appendChild(parentElement, hostElement);
  }

  private createSpan(renderer: Renderer2, text: string, className: string, isBold: boolean): HTMLSpanElement {
    const span: HTMLSpanElement = renderer.createElement('span');
    renderer.appendChild(span, renderer.createText(text));
    span.classList.add(className);
    if (isBold) {
      span.style.fontWeight = 'bold';
    }
    return span;
  }
}
