import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'twoDigits',
})
export class TwoDigitsPipe implements PipeTransform {
    transform(value: number | null | undefined): string {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            return '00';
        }

        return Math.trunc(value).toString().padStart(2, '0');
    }
}
