import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip adding JWT token to public endpoints that don't require authentication
  if (req.url.endsWith('/login') || req.url.endsWith('/register')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Check if token exists and is still valid
  if (token) {
    // If token has expired, clear it and redirect to login
    if (!authService.hasValidToken()) {
      authService.logout();
      router.navigate(['/login']);
      return next(req);
    }

    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};