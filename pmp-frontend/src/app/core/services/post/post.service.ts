import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/env.dev';
import { ApiResponse } from '../../models/API/ApiResponse';
import { User } from '../../../pages/admin/_components/data-table/user/user';
import { Post } from '../../../pages/admin/_components/data-table/post/post';

export interface PostDTO {
  id: string;
  name: string;
  message: string;
  read:boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  creator: User;
}

export interface PostRequestDTO {
  name: string;
  message: string;
  creatorId?: string;
  read?: boolean;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;
  private readonly baseEndpoint = '/api/v1/posts';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<PostDTO[]> {
    return this.http
      .get<ApiResponse<PostDTO[]>>(
        `${this.apiUrl}${this.baseEndpoint}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data || []));
  }

  getPostById(id: string): Observable<PostDTO> {
    return this.http
      .get<ApiResponse<PostDTO>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  createPost(data: PostRequestDTO): Observable<PostDTO> {
    return this.http
      .post<ApiResponse<PostDTO>>(
        `${this.apiUrl}${this.baseEndpoint}/create`,
        data,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  updatePost(id: string, data: PostRequestDTO): Observable<PostDTO> {
    return this.http
      .put<ApiResponse<PostDTO>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        data,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  deletePost(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map(() => undefined));
  }

  activatePost(id: string): Observable<PostDTO> {
    return this.http
      .put<ApiResponse<PostDTO>>(
        `${this.apiUrl}${this.baseEndpoint}/activate/${id}`,
        {},
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  setPostAsRead(id: string, isRead: boolean): Observable<PostDTO> {
    return this.http
      .put<ApiResponse<PostDTO>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}/read`,
        { read: isRead },
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }
}
