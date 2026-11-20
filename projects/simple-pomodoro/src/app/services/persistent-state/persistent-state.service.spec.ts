import { TestBed } from '@angular/core/testing';

import { PersistentStateService } from './persistent-state.service';

describe('PersistentStateService', () => {
    let service: PersistentStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PersistentStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
