import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post/post.service';
import { UserService } from '../../../core/services/user/user.service';
import { PostCard } from '../../../shared/components/post-card/post-card';
import { PostEditModal } from '../../../shared/components/post-edit-modal/post-edit-modal';
import { Post } from '../../../core/models/Post';
import Swal from 'sweetalert2';
import { Header } from '../_components/header/header';
import { Footer } from '../_components/footer/footer';

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, 
    FormsModule, 
    MatIconModule, 
    PostCard, 
    PostEditModal, 
    Header, Footer],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  userId = signal<number | null>(null);
  user = signal<UserProfile | null>(null);
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);
  isEditingProfile = signal<boolean>(false);
  selectedPostToEdit = signal<Post | null>(null);
  isUpdatingPost = signal<boolean>(false);

  // Form data
  editFormData = {
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  };

  formErrors = {
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = Number(params['id']);
      this.userId.set(id);
      this.loadUserProfile(id);
      this.loadUserPosts(id);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(userId: number) {
    this.isLoading.set(true);
    const currentUser = this.authService.getUser();
    
    // If viewing own profile, use local data
    if (currentUser && Number(currentUser.id) === userId) {
      this.user.set({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email
      });
      this.editFormData.name = currentUser.name;
      this.editFormData.email = currentUser.email;
      this.isLoading.set(false);
    } else {
      // Fetch other user's profile from backend
      this.userService.getPublicUserById(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (userData) => {
            this.user.set({
              id: Number(userData.id),
              name: userData.name,
              email: userData.email
            });
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading user profile:', err);
            Swal.fire({
              icon: 'error',
              title: 'User not found',
              text: 'The requested user profile does not exist'
            });
            this.router.navigate(['/']);
            this.isLoading.set(false);
          }
        });
    }
  }

  loadUserPosts(userId: number) {
    this.postService.getPostsByUserId(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.posts.set(posts);
        },
        error: (err) => {
          console.error('Error loading user posts:', err);
          this.posts.set([]);
        }
      });
  }

  isOwnProfile(): boolean {
    const currentUser = this.authService.getUser();
    return currentUser ? Number(currentUser.id) === this.userId() : false;
  }

  toggleEditProfile() {
    this.isEditingProfile.set(!this.isEditingProfile());
    this.clearFormErrors();
  }

  clearFormErrors() {
    this.formErrors = {
      name: '',
      email: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  validateForm(): boolean {
    this.clearFormErrors();
    let isValid = true;

    if (!this.editFormData.name.trim()) {
      this.formErrors.name = 'Name is required';
      isValid = false;
    } else if (this.editFormData.name.length < 3) {
      this.formErrors.name = 'Name must be at least 3 characters';
      isValid = false;
    }

    if (!this.editFormData.email.trim()) {
      this.formErrors.email = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.editFormData.email)) {
      this.formErrors.email = 'Invalid email format';
      isValid = false;
    }

    // If user wants to change password
    if (this.editFormData.newPassword) {
      if (this.editFormData.newPassword.length < 8) {
        this.formErrors.newPassword = 'New password must be at least 8 characters';
        isValid = false;
      }
      if (this.editFormData.newPassword !== this.editFormData.confirmPassword) {
        this.formErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }

  updateProfile() {
    if (!this.validateForm()) {
      return;
    }

    const updateData: { name?: string; email?: string; password?: string } = {
      name: this.editFormData.name,
      email: this.editFormData.email
    };

    // Only include password if user wants to change it
    if (this.editFormData.newPassword) {
      updateData.password = this.editFormData.newPassword;
    }

    this.authService.updateProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // If server returns a new token, update it
          if (response.token) {
            this.authService.setToken(response.token);
          }
          
          // Update local user with new data
          this.authService.updateLocalUser({
            name: this.editFormData.name,
            email: this.editFormData.email
          });

          if (this.user()) {
            this.user.set({
              ...this.user()!,
              name: this.editFormData.name,
              email: this.editFormData.email
            });
          }

          Swal.fire({
            icon: 'success',
            title: 'Profile updated',
            text: 'Your profile has been updated successfully',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });

          this.editFormData.newPassword = '';
          this.editFormData.confirmPassword = '';
          this.isEditingProfile.set(false);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          let errorMessage = 'Could not update profile';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 409) {
            errorMessage = 'This email is already in use';
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
        }
      });
  }

  createNewPost() {
    Swal.fire({
      title: 'Create New Post',
      html: `
        <div class="swal-post-form">
          <div class="swal-form-group">
            <label for="postTitle">Title</label>
            <input id="postTitle" class="swal-form-input" type="text" placeholder="Enter post title" maxlength="255" />
          </div>
          <div class="swal-form-group">
            <label for="postContent">Message</label>
            <textarea id="postContent" class="swal-form-textarea" placeholder="Write your message here..." maxlength="1000" rows="6"></textarea>
            <span class="swal-char-count"><span id="charCount">0</span>/1000</span>
          </div>
        </div>
      `,
      confirmButtonText: 'Create Post',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      customClass: {
        popup: 'swal-post-popup',
        title: 'swal-post-title',
        htmlContainer: 'swal-post-container',
        confirmButton: 'swal-post-confirm',
        cancelButton: 'swal-post-cancel',
        actions: 'swal-post-actions'
      },
      didOpen: () => {
        const textarea = document.getElementById('postContent') as HTMLTextAreaElement;
        const charCount = document.getElementById('charCount');
        if (textarea && charCount) {
          textarea.addEventListener('input', () => {
            charCount.textContent = String(textarea.value.length);
          });
        }
      },
      preConfirm: () => {
        const title = (document.getElementById('postTitle') as HTMLInputElement)?.value || '';
        const content = (document.getElementById('postContent') as HTMLTextAreaElement)?.value || '';
        
        if (!title.trim() || !content.trim()) {
          Swal.showValidationMessage('Title and message are required');
          return false;
        }
        return { title, content };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { title, content } = result.value;

        this.postService.createPost({
          name: title,
          message: content
        }).subscribe({
          next: (createdPost) => {
            this.posts.set([createdPost, ...this.posts()]);
            Swal.fire({
              icon: 'success',
              title: 'Post created!',
              text: 'Your post has been published successfully',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
          },
          error: (err) => {
            console.error('Error creating post:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Could not create the post. Please try again.'
            });
          }
        });
      }
    });
  }

  onEditPost(post: Post) {
    this.selectedPostToEdit.set(post);
  }

  onPostEditingClosed(updatedPost?: Post) {
    this.selectedPostToEdit.set(null);

    if (updatedPost) {
      const currentPosts = this.posts();
      const index = currentPosts.findIndex(p => p.id === updatedPost.id);
      if (index !== -1) {
        const updatedPosts = [...currentPosts];
        updatedPosts[index] = updatedPost;
        this.posts.set(updatedPosts);
      }
    }
  }

  onDeletePost(postId: number) {
    // Only updates local UI - post-card already called backend and showed the message
    const currentPosts = this.posts();
    const filteredPosts = currentPosts.filter(p => p.id !== postId);
    this.posts.set(filteredPosts);
  }

  getAvatarColor(): string {
    if (!this.user()) return '#3b82f6';
    let hash = 0;
    const email = this.user()!.email;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#3b82f6', '#0ea5e9', '#f093fb', '#4facfe', '#43e97b',
      '#fa709a', '#fee140', '#30b0fe', '#fb5283', '#a8edea'
    ];
    return colors[Math.abs(hash) % colors.length];
  }
}
