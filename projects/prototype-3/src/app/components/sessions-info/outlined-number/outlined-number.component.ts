import { IonText } from '@ionic/angular';

import { Component, input } from '@angular/core';

import { CustomIonicColors } from '../../../design-system/ionic-colors';
import { TimerSessionType } from '../../../services/timer-sessions/timer-session.interface';

@Component({
    selector: 'app-outlined-number',
    templateUrl: './outlined-number.component.html',
    styleUrls: ['./outlined-number.component.scss'],
    imports: [IonText],
})
export class OutlinedNumberComponent {
    readonly number = input.required<number>();
    readonly sessionType = input.required<TimerSessionType>();

    //   TODO: move to a theme service/design system service or pass the color directly to the component
    protected get textColor() {
        switch (this.sessionType()) {
            case TimerSessionType.Focus:
                return CustomIonicColors.FocusDarker;

            case TimerSessionType.ShortRest:
            case TimerSessionType.LongRest:
                return CustomIonicColors.RestDarker;

            default:
                return CustomIonicColors.FocusDarker;
        }
    }

    //   TODO: move to a theme service/design system service or pass the color directly to the component
    protected get outlineColor() {
        switch (this.sessionType()) {
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
