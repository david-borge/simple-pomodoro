import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { Prototype1Page } from './prototype-1.page';

describe('SimplePomodoroPrototype1Page', () => {
  let component: Prototype1Page;
  let fixture: ComponentFixture<Prototype1Page>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Prototype1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
