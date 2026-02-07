import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Profile } from './profile/profile';
import { authGuard } from '../../core/guards/auth.guard';

export const CLIENT_ROUTES: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login, canActivate:[authGuard]},
  { path: 'register', component: Register, canActivate:[authGuard] },
  { path: 'profile/:id', component: Profile }
];