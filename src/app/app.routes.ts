import type { Routes } from '@angular/router';

enum RouteSlugs {
  Prototype1 = 'prototype-1',
  Prototype2 = 'prototype-2',
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: RouteSlugs.Prototype2,
    pathMatch: 'full',
  },
  {
    path: RouteSlugs.Prototype1,
    loadComponent: () => import('./prototype-1/pages/prototype-1/prototype-1.page').then((m) => m.Prototype1Page),
  },
  {
    path: RouteSlugs.Prototype2,
    loadComponent: () => import('./prototype-2/pages/prototype-2/prototype-2.page').then((m) => m.Prototype2Page),
  },
];
