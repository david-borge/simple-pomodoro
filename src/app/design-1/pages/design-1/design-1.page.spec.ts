import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { Design1Page } from './design-1.page';

describe('SimplePomodoroPrototype1Page', () => {
  let component: Design1Page;
  let fixture: ComponentFixture<Design1Page>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Design1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
