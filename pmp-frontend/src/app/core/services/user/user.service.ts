import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/env.dev';
import { ApiResponse } from '../../models/API/ApiResponse';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  roles?: string[];
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private readonly baseEndpoint = '/api/v1/admin/user';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserDTO[]> {
    return this.http
      .get<ApiResponse<UserDTO[]>>(
        `${this.apiUrl}/api/v1/admin/users`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data || []));
  }

  getUserById(id: string): Observable<UserDTO> {
    return this.http
      .get<ApiResponse<UserDTO>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  createUser(data: CreateUserDTO): Observable<UserDTO> {
    return this.http
      .post<ApiResponse<UserDTO>>(
        `${this.apiUrl}${this.baseEndpoint}`,
        data,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  updateUser(id: string, data: UpdateUserDTO): Observable<UserDTO> {
    return this.http
      .put<ApiResponse<UserDTO>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        data,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  deleteUser(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map(() => undefined));
  }

  activateUser(id: string): Observable<UserDTO> {
    return this.http
      .put<ApiResponse<UserDTO>>(
        `${this.apiUrl}/api/v1/admin/user/activate/${id}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }
}
