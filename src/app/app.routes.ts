import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'simple-pomodoro',
    pathMatch: 'full',
  },
  {
    path: 'simple-pomodoro',
    loadComponent: () => import('./pages/simple-pomodoro/simple-pomodoro.page').then((m) => m.SimplePomodoroPage),
  },
];
