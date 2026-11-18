import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlinedNumberComponent } from './outlined-number.component';

describe('OutlinedNumberComponent', () => {
  let component: OutlinedNumberComponent;
  let fixture: ComponentFixture<OutlinedNumberComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OutlinedNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
