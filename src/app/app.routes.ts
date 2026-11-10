import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'simple-pomodoro',
    pathMatch: 'full',
  },
  {
    path: 'simple-pomodoro',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
];
