import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && state.url === '/login') {
    router.navigate(['/home']);
    return false;
  }

  if (!authService.isAuthenticated()) {
    if (state.url !== '/login' && state.url !== '/register') {
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};
