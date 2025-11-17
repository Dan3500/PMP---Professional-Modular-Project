import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/client/client.routes').then(m => m.CLIENT_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
