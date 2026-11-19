import { TestBed } from '@angular/core/testing';

import { TimeConversionService } from './time-conversion.service';

describe('TimeConversionService', () => {
    let service: TimeConversionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimeConversionService);
    });

    it('should convert seconds to hours, minutes and seconds', () => {
        expect(service.totalSecondsToHours(3661)).toBe(1);
        expect(service.totalSecondsToMinutes(3661)).toBe(1);
        expect(service.totalSecondsToSeconds(3661)).toBe(1);
    });

    it('should normalize values when converting', () => {
        expect(service.totalSecondsToHours(3661.9)).toBe(1);
        expect(service.totalSecondsToMinutes(-1)).toBe(0);
        expect(service.totalSecondsToSeconds(Number.NaN)).toBe(0);
    });

    it('should keep timer minutes and seconds in the range 0 to 59', () => {
        expect(service.totalSecondsToMinutes(3599)).toBe(59);
        expect(service.totalSecondsToMinutes(3600)).toBe(0);
        expect(service.totalSecondsToSeconds(59)).toBe(59);
        expect(service.totalSecondsToSeconds(60)).toBe(0);
    });
});
