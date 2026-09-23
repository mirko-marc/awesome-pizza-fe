import { Routes } from '@angular/router';
import { authGuard } from '@app/core/auth/auth.guard';
import { AdminShellComponent } from './admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Accesso personale · Awesome Pizza',
    loadComponent: () =>
      import('./pages/login/admin-login-page.component').then((m) => m.AdminLoginPageComponent),
  },
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'orders',
      },
      {
        path: 'orders',
        title: 'Gestione ordini · Awesome Pizza',
        loadComponent: () =>
          import('./pages/orders/admin-orders-page.component').then((m) => m.AdminOrdersPageComponent),
      },
      {
        path: 'orders/:orderCode',
        title: 'Dettaglio ordine · Awesome Pizza',
        loadComponent: () =>
          import('./pages/order-detail/admin-order-detail-page.component').then(
            (m) => m.AdminOrderDetailPageComponent,
          ),
      },
    ],
  },
];
