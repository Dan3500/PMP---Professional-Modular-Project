import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwtHelper = new JwtHelperService();

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded.roles || [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
}
