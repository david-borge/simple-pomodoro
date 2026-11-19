import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { SimplePomodoroPrototype1Page } from './simple-pomodoro.prototype-1.page';

describe('SimplePomodoroPrototype1Page', () => {
    let component: SimplePomodoroPrototype1Page;
    let fixture: ComponentFixture<SimplePomodoroPrototype1Page>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(SimplePomodoroPrototype1Page);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
