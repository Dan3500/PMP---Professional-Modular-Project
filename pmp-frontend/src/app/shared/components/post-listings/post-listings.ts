import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCard } from '../post-card/post-card';
import { PostEditModal } from '../post-edit-modal/post-edit-modal';
import { Post } from '../../../core/models/Post';
import { PostService } from '../../../core/services/post/post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-listings',
  standalone: true,
  imports: [CommonModule, PostCard, PostEditModal],
  templateUrl: './post-listings.html',
  styleUrl: './post-listings.css'
})
export class PostListings implements OnInit {
  private postService = inject(PostService);
  
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);
  selectedPostToEdit = signal<Post | null>(null);
  isUpdatingPost = signal<boolean>(false);

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.postService.getPosts().subscribe({
      next: (posts: Post[]) => {
        this.posts.set(posts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load posts',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        this.isLoading.set(false);
      }
    });
  }

  onEditPost(post: Post) {
    this.selectedPostToEdit.set(post);
  }

  onPostEditingClosed(updatedPost?: Post) {
    this.selectedPostToEdit.set(null);
    
    // If there's an updated post, only update that one instead of reloading all
    if (updatedPost) {
      this.isUpdatingPost.set(true);
      setTimeout(() => {
        const currentPosts = this.posts();
        const index = currentPosts.findIndex(p => p.id === updatedPost.id);
        if (index !== -1) {
          const updatedPosts = [...currentPosts];
          updatedPosts[index] = updatedPost;
          this.posts.set(updatedPosts);
        }
        this.isUpdatingPost.set(false);
      }, 300);
    }
  }

  onDeletePost(postId: number) {
    // Remove post from local list
    const currentPosts = this.posts();
    const filteredPosts = currentPosts.filter(p => p.id !== postId);
    this.posts.set(filteredPosts);
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Deleted',
      text: 'Post deleted successfully',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    });
  }
}
