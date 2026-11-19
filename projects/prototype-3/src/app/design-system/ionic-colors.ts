import { PredefinedColors } from '@ionic/core';

export enum CustomIonicColors {
    Focus = 'focus',
    FocusLighter = 'focus-lighter',
    FocusDarker = 'focus-darker',
    Rest = 'rest',
    RestLighter = 'rest-lighter',
    RestDarker = 'rest-darker',
}

export type IonicColors = PredefinedColors | CustomIonicColors;
