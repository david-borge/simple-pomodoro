import { TestBed } from '@angular/core/testing';
import { EditTimerService } from './edit-timer.service';

describe('EditTimerService', () => {
  let service: EditTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
