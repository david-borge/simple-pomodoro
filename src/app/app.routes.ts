import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'simple-pomodoro-prototype-1',
    pathMatch: 'full',
  },
  {
    path: 'simple-pomodoro-prototype-1',
    loadComponent: () =>
      import('./simple-pomodoro.prototype-1/pages/simple-pomodoro.prototype-1/simple-pomodoro.prototype-1.page').then(
        (m) => m.SimplePomodoroPrototype1Page,
      ),
  },
];
