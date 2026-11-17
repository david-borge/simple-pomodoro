import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerControlsStartPauseCancelComponent } from './timer-controls-start-pause-cancel.component';

describe('TimerControlsStartPauseCancelComponent', () => {
  let component: TimerControlsStartPauseCancelComponent;
  let fixture: ComponentFixture<TimerControlsStartPauseCancelComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TimerControlsStartPauseCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
