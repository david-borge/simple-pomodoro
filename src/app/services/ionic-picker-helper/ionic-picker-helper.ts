import { Service } from '@angular/core';

type IonicPickerChangeEvent = CustomEvent<{ value: string | number | undefined }>;

@Service()
export class IonicPickerHelperService {
  getIonicPickerValueFromChangeEvent<T extends string>(
    event: IonicPickerChangeEvent,
    currentValue: T,
    allowedValues: ReadonlySet<T>,
  ): T {
    const value = event.detail.value;
    if (typeof value === 'string' && this.isAllowedIonicPickerValue(value, allowedValues)) {
      return value;
    }

    return currentValue;
  }

  private isAllowedIonicPickerValue<T extends string>(value: string, allowedValues: ReadonlySet<T>): value is T {
    for (const allowedValue of allowedValues) {
      if (allowedValue === value) {
        return true;
      }
    }

    return false;
  }
}
