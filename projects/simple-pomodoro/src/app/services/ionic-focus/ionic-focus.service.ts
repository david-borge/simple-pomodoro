import { componentOnReady } from '@ionic/core/components';

import { Service } from '@angular/core';

@Service()
export class IonicFocusService {
    private readonly ionButtonsWithBlurTracking = new WeakSet<HTMLIonButtonElement>();
    private readonly ionFocusedClass = 'ion-focused';

    public focusIonButton(ionButton: HTMLIonButtonElement): void {
        componentOnReady(ionButton, () => {
            const nativeButton =
                ionButton.shadowRoot?.querySelector<HTMLElement>('[part="native"]');

            if (!nativeButton) {
                return;
            }

            this.trackFocusClassRemovalOnBlur(ionButton);
            nativeButton.focus({ preventScroll: true });

            if (ionButton.shadowRoot?.activeElement === nativeButton) {
                ionButton.classList.add(this.ionFocusedClass);
            }
        });
    }

    private trackFocusClassRemovalOnBlur(ionButton: HTMLIonButtonElement): void {
        if (this.ionButtonsWithBlurTracking.has(ionButton)) {
            return;
        }

        ionButton.addEventListener('ionBlur', () => {
            ionButton.classList.remove(this.ionFocusedClass);
        });
        this.ionButtonsWithBlurTracking.add(ionButton);
    }
}
