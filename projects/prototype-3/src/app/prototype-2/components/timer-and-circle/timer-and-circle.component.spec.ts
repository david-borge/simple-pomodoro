import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerAndCircleComponent } from './timer-and-circle.component';

describe('TimerAndCircleComponent', () => {
  let component: TimerAndCircleComponent;
  let fixture: ComponentFixture<TimerAndCircleComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TimerAndCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
