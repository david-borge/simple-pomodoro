import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { SimplePomodoroPage } from './simple-pomodoro.page';

describe('SimplePomodoroPage', () => {
  let component: SimplePomodoroPage;
  let fixture: ComponentFixture<SimplePomodoroPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SimplePomodoroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
