import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../../core/models/Post';
import { PostService } from '../../../core/services/post/post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-edit-modal.html',
  styleUrl: './post-edit-modal.css'
})
export class PostEditModal {
  @Input() post!: Post;
  @Output() close = new EventEmitter<Post | undefined>();

  private postService = inject(PostService);
  
  formData = {
    name: '',
    message: ''
  };
  
  isLoading = false;

  ngOnInit() {
    // Initialize form with post data
    this.formData.name = this.post.name;
    this.formData.message = this.post.message;
  }

  onClose() {
    this.close.emit(undefined);
  }

  onSubmit() {
    // Basic validation
    if (!this.formData.name.trim() || !this.formData.message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Required fields',
        text: 'Please fill in all fields',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    this.isLoading = true;

    this.postService.updatePost(String(this.post.id), {
      name: this.formData.name,
      message: this.formData.message
    }).subscribe({
      next: (updatedPost) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Post updated',
          text: 'Your post has been updated successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
        this.close.emit(updatedPost);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating post:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not update the post',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    });
  }
}
