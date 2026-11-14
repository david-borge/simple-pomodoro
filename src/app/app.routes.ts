import type { Routes } from '@angular/router';

enum RouteSlugs {
  Prototype1 = 'prototype-1',
  Design1 = 'design-1',
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: RouteSlugs.Design1,
    pathMatch: 'full',
  },
  {
    path: RouteSlugs.Prototype1,
    loadComponent: () => import('./prototype-1/pages/prototype-1/prototype-1.page').then((m) => m.Prototype1Page),
  },
  {
    path: RouteSlugs.Design1,
    loadComponent: () => import('./design-1/pages/design-1/design-1.page').then((m) => m.Design1Page),
  },
];
