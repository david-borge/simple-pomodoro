import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { Prototype2Page } from './prototype-2.page';

describe('SimplePomodoroPrototype1Page', () => {
  let component: Prototype2Page;
  let fixture: ComponentFixture<Prototype2Page>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Prototype2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
