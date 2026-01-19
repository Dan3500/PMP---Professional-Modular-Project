import { Routes } from '@angular/router';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { adminGuard as authAdminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  { path: 'dashboard', 
    children: [
      { path: 'users', component: AdminDashboard, data: { title: 'Dashboard Users', table: 'users' } },
      { path: 'posts', component: AdminDashboard, data: { title: 'Dashboard Posts', table: 'posts' } },
    ],
    canActivate: [authAdminGuard]
  },
  { path: '**', redirectTo: 'dashboard/users', pathMatch: 'full' }
];