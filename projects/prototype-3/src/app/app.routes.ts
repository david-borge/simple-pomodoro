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
    loadComponent: () => import('./prototype-2/pages/prototype-2/prototype-2.page').then((m) => m.Prototype2Page),
  },
  {
    path: '**', // Cualquier URL que no coincida con ninguna de las anteriores de la lista de la constante appRoutes
    redirectTo: RouteSlugs.Prototype3,
  },
];
