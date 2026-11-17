import { PredefinedColors } from '@ionic/core';

export enum CustomIonicColors {
  Focus = 'focus',
  FocusLighter = 'focus-lighter',
  Rest = 'rest',
  RestLighter = 'rest-lighter',
}

export type IonicColors = PredefinedColors | CustomIonicColors;
