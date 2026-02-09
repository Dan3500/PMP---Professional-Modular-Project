import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/env.dev';
import { ApiResponse } from '../../models/API/ApiResponse';
import { Post } from '../../models/Post';

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
  private readonly adminEndpoint = '/api/v1/admin/posts';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http
      .get<ApiResponse<Post[]>>(
        `${this.apiUrl}${this.baseEndpoint}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data || []));
  }

  // Get all posts for admin (including inactive)
  getAdminPosts(): Observable<Post[]> {
    return this.http
      .get<ApiResponse<Post[]>>(
        `${this.apiUrl}${this.adminEndpoint}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data || []));
  }

  getPostById(id: string): Observable<Post> {
    return this.http
      .get<ApiResponse<Post>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  getPostsByUserId(userId: number): Observable<Post[]> {
    return this.http
      .get<ApiResponse<Post[]>>(
        `${this.apiUrl}/api/v1/users/${userId}/posts`,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data || []));
  }

  createPost(data: PostRequestDTO): Observable<Post> {
    return this.http
      .post<ApiResponse<Post>>(
        `${this.apiUrl}${this.baseEndpoint}`,
        data,
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  updatePost(id: string, data: PostRequestDTO): Observable<Post> {
    return this.http
      .put<ApiResponse<Post>>(
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

  activatePost(id: string, currentStatus: boolean): Observable<Post> {
    return this.http
      .put<ApiResponse<Post>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}`,
        { active: !currentStatus },
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }

  setPostAsRead(id: string, isRead: boolean): Observable<Post> {
    return this.http
      .put<ApiResponse<Post>>(
        `${this.apiUrl}${this.baseEndpoint}/${id}/read`,
        { read: isRead },
        { headers: { 'Accept': 'application/json' } }
      )
      .pipe(map((response) => response.data!));
  }
}
