import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Post } from '../../../core/models/Post';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post/post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css'
})
export class PostCard {
  @Input() post!: Post;
  @Output() editPost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<number>();

  private router = inject(Router);

  constructor(public auth: AuthService, private postService: PostService) {}

  onEdit() {
    this.editPost.emit(this.post);
  }

  onDelete() {
    Swal.fire({
      title: 'Delete post?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#cbd5e0',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletePostRequest();
      }
    });
  }

  private deletePostRequest() {
    this.postService.deletePost(String(this.post.id)).subscribe({
      next: () => {
        this.deletePost.emit(this.post.id);
        Swal.fire({
          icon: 'success',
          title: 'Post deleted',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error deleting',
          text: 'Could not delete the post',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  }

  isOwnPost(): boolean {
    const currentUser = this.auth.getUser();
    
    if (!currentUser) {
      return false;
    }

    const isOwner = Number(currentUser.id) === Number(this.post.creator.id);
    return isOwner;
  }

  getAvatarColor(): string {
    // Generate color based on creator's email hash
    let hash = 0;
    const email = this.post.creator.email;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#3b82f6', '#0ea5e9', '#f093fb', '#4facfe', '#43e97b',
      '#fa709a', '#fee140', '#30b0fe', '#fb5283', '#a8edea'
    ];
    return colors[Math.abs(hash) % colors.length];
  }

  goToCreatorProfile() {
    if (this.post.creator.id) {
      this.router.navigate(['/profile', this.post.creator.id]);
    }
  }
}
