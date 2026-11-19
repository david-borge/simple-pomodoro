import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/simple-pomodoro/simple-pomodoro.page').then((m) => m.SimplePomodoroPage),
  },
  {
    path: '**', // Cualquier URL que no coincida con ninguna de las anteriores de la lista de la constante appRoutes
    redirectTo: '',
  },
];
