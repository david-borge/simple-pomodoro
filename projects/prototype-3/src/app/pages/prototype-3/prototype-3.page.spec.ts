import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { Prototype3Page } from './prototype-3.page';

describe('SimplePomodoroPrototype1Page', () => {
    let component: Prototype3Page;
    let fixture: ComponentFixture<Prototype3Page>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(Prototype3Page);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
