import type { Routes } from '@angular/router';

enum RouteSlugs {
  Prototype3 = 'prototype-3',
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: RouteSlugs.Prototype3,
    pathMatch: 'full',
  },
  {
    path: RouteSlugs.Prototype3,
    loadComponent: () => import('./pages/prototype-3/prototype-3.page').then((m) => m.Prototype3Page),
  },
  {
    path: '**', // Cualquier URL que no coincida con ninguna de las anteriores de la lista de la constante appRoutes
    redirectTo: RouteSlugs.Prototype3,
  },
];
