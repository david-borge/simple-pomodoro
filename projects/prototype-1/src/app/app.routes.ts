import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'prototype-1',
    pathMatch: 'full',
  },
  {
    path: 'prototype-1',
    loadComponent: () =>
      import('./pages/simple-pomodoro.prototype-1/simple-pomodoro.prototype-1.page').then(
        (m) => m.SimplePomodoroPrototype1Page,
      ),
  },
  {
    path: '**', // Cualquier URL que no coincida con ninguna de las anteriores de la lista de la constante appRoutes
    redirectTo: 'prototype-1',
  },
];
