import { TestBed } from '@angular/core/testing';

import { IonicPickerHelper } from './ionic-picker-helper';

describe('IonicPickerHelper', () => {
    let service: IonicPickerHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IonicPickerHelper);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
