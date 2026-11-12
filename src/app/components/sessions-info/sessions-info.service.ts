import { ElementRef, Renderer2, Service } from '@angular/core';

/**
 * Presenter service handling imperative DOM creation and styling.
 * Satisfies SRP and OCP by isolating DOM manipulation from component business logic.
 */
@Service()
export class SessionsInfoService {
  renderSessionsInfo(
    el: ElementRef,
    renderer: Renderer2,
    focusSessions: number | null,
    shortRests: number | null,
    longRests: number | null,
  ): void {
    const targetElement = this.getTargetElement(el);

    if (!targetElement) return;

    if (focusSessions === null) {
      this.clearSessionsInfo(targetElement, renderer);
      return;
    }

    this.clearSessionsInfo(targetElement, renderer);

    const paragraphEl = this.createSessionsInfoParagraph(renderer, focusSessions, shortRests, longRests);
    renderer.appendChild(targetElement, paragraphEl);
  }

  private getTargetElement(el: ElementRef): Element | null {
    return (
      el.nativeElement.querySelector('#timer-sessions-info-text') || document.getElementById('timer-sessions-info-text')
    );
  }

  private clearSessionsInfo(targetElement: Element, renderer: Renderer2): void {
    const existingInfo = targetElement.querySelector('#timer-sessions-info-dynamic');
    if (existingInfo) renderer.removeChild(targetElement, existingInfo);
  }

  private createSessionsInfoParagraph(
    renderer: Renderer2,
    focusSessions: number,
    shortRests: number | null,
    longRests: number | null,
  ): HTMLParagraphElement {
    const paragraphEl: HTMLParagraphElement = renderer.createElement('p');
    paragraphEl.style.setProperty('margin-bottom', '0');
    renderer.setAttribute(paragraphEl, 'id', 'timer-sessions-info-dynamic');

    this.appendInitialText(paragraphEl, renderer);
    this.appendFocusSessions(paragraphEl, renderer, focusSessions);
    this.appendRestSessions(paragraphEl, renderer, shortRests, longRests);

    renderer.appendChild(paragraphEl, renderer.createText('.'));
    return paragraphEl;
  }

  private appendInitialText(paragraphEl: HTMLParagraphElement, renderer: Renderer2): void {
    renderer.appendChild(paragraphEl, renderer.createText("You'll have "));
  }

  private appendFocusSessions(paragraphEl: HTMLParagraphElement, renderer: Renderer2, focusSessions: number): void {
    renderer.appendChild(paragraphEl, this.createSpan(renderer, focusSessions.toString(), 'text-focus-color', true));
    renderer.appendChild(
      paragraphEl,
      this.createSpan(renderer, focusSessions === 1 ? ' focus session' : ' focus sessions', 'text-focus-color', false),
    );
  }

  private appendRestSessions(
    paragraphEl: HTMLParagraphElement,
    renderer: Renderer2,
    shortRests: number | null,
    longRests: number | null,
  ): void {
    if (shortRests === null || longRests === null) return;

    const totalRests = shortRests + longRests;
    if (totalRests < 1) return;

    renderer.appendChild(paragraphEl, renderer.createText(' and '));
    renderer.appendChild(paragraphEl, this.createSpan(renderer, totalRests.toString(), 'text-rest-color', true));
    renderer.appendChild(
      paragraphEl,
      this.createSpan(renderer, totalRests === 1 ? ' rest' : ' rests', 'text-rest-color', false),
    );
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
