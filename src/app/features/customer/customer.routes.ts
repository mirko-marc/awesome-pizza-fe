import { Routes } from '@angular/router';
import { CustomerShellComponent } from './customer-shell.component';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: CustomerShellComponent,
    children: [
      {
        path: '',
        title: 'Menu · Awesome Pizza',
        loadComponent: () => import('./pages/menu/menu-page.component').then((m) => m.MenuPageComponent),
      },
      {
        path: 'confirmation/:orderCode',
        title: 'Ordine confermato · Awesome Pizza',
        loadComponent: () =>
          import('./pages/confirmation/confirmation-page.component').then((m) => m.ConfirmationPageComponent),
      },
      {
        path: 'track',
        title: 'Segui ordine · Awesome Pizza',
        loadComponent: () =>
          import('./pages/tracking/tracking-page.component').then((m) => m.TrackingPageComponent),
      },
      {
        path: 'track/:orderCode',
        title: 'Segui ordine · Awesome Pizza',
        loadComponent: () =>
          import('./pages/tracking/tracking-page.component').then((m) => m.TrackingPageComponent),
      },
    ],
  },
];
