import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/env.dev';
import { HttpClient } from '@angular/common/http';
import { LoginFormModel } from '../models/form/LoginFormModel';
import { signal, computed } from '@angular/core';
import { RegisterFormModel } from '../models/form/RegisterFormModel';
import { ApiResponse } from '../models/API/ApiResponse';
import { RegisterResponse } from '../models/API/RegisterResponse';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwtHelper = new JwtHelperService();
  private apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {
    // Initialize signals with the current token
    this._isAuthenticated.set(this.hasValidToken());
    this._roles.set(this.getRolesFromToken());
  }

  // ======================
  // SIGNALS -> Authentication State 
  // ======================

  // Internal state with Signal
  private _isAuthenticated = signal<boolean>(false);
  // Public state for Auth as computed
  isAuthenticated = computed(() => this._isAuthenticated());

  // Roles as signal
  private _roles = signal<string[]>([]);
  roles = computed(() => this._roles());

  private _user = signal<User | null>(null);
  user = computed(() => this._user());



  // ======================
  // AUTHENTICATION METHODS
  // ======================
  /**
   * Method to store the JWT  in local storage
   * @param token: JWT string
   */
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
    this._isAuthenticated.set(true);
    this._roles.set(this.getRolesFromToken());
  }

  /**
   * Method to retrieve the JWT from local storage
   * @returns JWT
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Method to check if the JWT is valid
   * @returns boolean: true if the token is valid, false otherwise
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Method to retrieve the roles from the JWT
   * @returns string[] Array of roles of the user
   */
  getRoles(): string[] {
    return this._roles();
  }

  /**
   *  Method to extract roles from the JWT
   * @returns string[] Array of roles extracted from the token
   */
  private getRolesFromToken(): string[] {
    const token = this.getToken();
    if (!token) return [];
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded.roles || [];
  }

  /**
   * Method to check if the user has a specific role
   * @param role: string Role to check
   * @returns boolean
   */
  hasRole(role: string): boolean {
    return this._roles().includes(role);
  }


  /**
   *  Method to set user data and store in signal for global access
   * @returns void
   */
  setUser(user:User): void {
    this._user.set(user);
  }

  /**
   *  Method to get user data from signal for global access
   * @returns User | null
   */
  getUser(): User | null {
    return this._user();
  }

  /**
   * Method to log out the user by removing the JWT from local storage
   */
  logout(): void {
    localStorage.removeItem('access_token');
    this._isAuthenticated.set(false);
    this._roles.set([]);
  }


  // ======================
  // HTTP REQUEST METHODS
  // ======================
  /**
   * Method to log in the user by sending credentials to the backend
   * @param form: LoginFormModel
   * @returns ApiResponse Server response with the data of the login try
   */
  login(form: LoginFormModel) {
    return this._http.post<ApiResponse>(`${this.apiUrl}/login`, form);
  }

  /**
   * Method to log in the user by sending credentials to the backend
   * @param form: LoginFormModel
   * @returns ApiResponse Server response with the data of the registration try
   */
  register(form:RegisterFormModel) {
    return this._http.post<ApiResponse<RegisterResponse>>(`${this.apiUrl}/register`, form);
  }
}
