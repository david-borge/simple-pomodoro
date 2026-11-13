import type { Routes } from '@angular/router';

enum RouteSlugs {
  Prototype1 = 'prototype-1',
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: RouteSlugs.Prototype1,
    pathMatch: 'full',
  },
  {
    path: RouteSlugs.Prototype1,
    loadComponent: () => import('./prototype-1/pages/prototype-1/prototype-1.page').then((m) => m.Prototype1Page),
  },
];
