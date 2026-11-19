import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    PreloadAllModules,
    provideRouter,
    RouteReuseStrategy,
    withComponentInputBinding,
    withPreloading,
} from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { TimerService } from './app/services/timer/timer.service';

bootstrapApplication(AppComponent, {
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular({ mode: 'md' }),
        provideAppInitializer(() => inject(TimerService).restorePersistedState()),
        provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    ],
});
