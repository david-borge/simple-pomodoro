import type { Routes } from '@angular/router';

enum RouteSlugs {
  Prototype2 = 'prototype-2',
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: RouteSlugs.Prototype2,
    pathMatch: 'full',
  },
  {
    path: RouteSlugs.Prototype2,
    loadComponent: () => import('./pages/prototype-2/prototype-2.page').then((m) => m.Prototype2Page),
  },
  {
    path: '**', // Cualquier URL que no coincida con ninguna de las anteriores de la lista de la constante appRoutes
    redirectTo: RouteSlugs.Prototype2,
  },
];
