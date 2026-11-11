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
    // Target element lookup
    const targetElement: Element | null =
      el.nativeElement.querySelector('#timer-sessions-info-text') ||
      document.getElementById('timer-sessions-info-text');

    if (!targetElement) return;

    while (targetElement.firstChild) {
      renderer.removeChild(targetElement, targetElement.firstChild);
    }

    if (focusSessions === null || (focusSessions <= 1 && shortRests === 0)) return;

    const paragraphEl: HTMLParagraphElement = renderer.createElement('p');

    // Initial text
    renderer.appendChild(paragraphEl, renderer.createText("You'll have "));

    // Focus sessions span
    const focusSpan = this.createSpan(renderer, focusSessions.toString(), 'text-focus-color', true);
    renderer.appendChild(paragraphEl, focusSpan);

    const focusText = focusSessions === 1 ? ' focus session' : ' focus sessions';
    const focusTextSpan = this.createSpan(renderer, focusText, 'text-focus-color', false);
    renderer.appendChild(paragraphEl, focusTextSpan);

    // Rest sessions if applicable
    if (shortRests !== null && longRests !== null) {
      const totalRests = shortRests + longRests;
      if (totalRests >= 1) {
        renderer.appendChild(paragraphEl, renderer.createText(' and '));

        const restSpan = this.createSpan(renderer, totalRests.toString(), 'text-rest-color', true);
        renderer.appendChild(paragraphEl, restSpan);

        const restText = totalRests === 1 ? ' rest' : ' rests';
        const restTextSpan = this.createSpan(renderer, restText, 'text-rest-color', false);
        renderer.appendChild(paragraphEl, restTextSpan);
      }
    }

    renderer.appendChild(paragraphEl, renderer.createText('.'));

    targetElement.classList.add('ion-text-center');
    renderer.appendChild(targetElement, paragraphEl);
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
