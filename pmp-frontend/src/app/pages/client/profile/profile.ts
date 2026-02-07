import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
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
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  formErrors = {
    name: '',
    email: '',
    currentPassword: '',
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
    // Simulando la carga del perfil - En producción, usarías un servicio
    const currentUser = this.authService.getUser();
    if (currentUser && Number(currentUser.id) === userId) {
      this.user.set({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email
      });
      this.editFormData.name = currentUser.name;
      this.editFormData.email = currentUser.email;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'User not found',
        text: 'The requested user profile does not exist'
      });
      this.router.navigate(['/']);
    }
    this.isLoading.set(false);
  }

  loadUserPosts(userId: number) {
    const currentUser = this.authService.getUser();
    if (currentUser && Number(currentUser.id) === userId) {
        //TODO Cargar posts del usuario desde el backend
        const postsData = null;
      if (postsData) {
        try {
          this.posts.set(JSON.parse(postsData));
        } catch (e) {
          this.posts.set([]);
        }
      }
    }
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
      currentPassword: '',
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

    // Si quiere cambiar contraseña
    if (this.editFormData.newPassword) {
      if (!this.editFormData.currentPassword) {
        this.formErrors.currentPassword = 'Current password is required';
        isValid = false;
      }
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

  async updateProfile() {
    if (!this.validateForm()) {
      return;
    }

    try {
      // Aquí iría la llamada al backend para actualizar el perfil
      // Por ahora, simulamos el éxito
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

      if (this.user()) {
        this.user.set({
          ...this.user()!,
          name: this.editFormData.name,
          email: this.editFormData.email
        });
      }

      this.editFormData.currentPassword = '';
      this.editFormData.newPassword = '';
      this.editFormData.confirmPassword = '';
      this.isEditingProfile.set(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not update profile'
      });
    }
  }

  createNewPost() {
    Swal.fire({
      title: 'Create new post',
      html: `
        <textarea id="postTitle" class="swal2-textarea" placeholder="Post title" maxlength="255" style="width: 100%; margin-bottom: 10px;"></textarea>
        <textarea id="postContent" class="swal2-textarea" placeholder="Post content" maxlength="1000" style="width: 100%; height: 150px;"></textarea>
      `,
      confirmButtonText: 'Create',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        const title = (document.getElementById('postTitle') as HTMLTextAreaElement)?.value || '';
        const content = (document.getElementById('postContent') as HTMLTextAreaElement)?.value || '';

        if (!title.trim() || !content.trim()) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Title and content are required'
          });
          return;
        }

        // Aquí iría la llamada al backend para crear el post
        const newPost: Post = {
          id: Date.now(),
          name: title,
          message: content,
          read: false,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: {
            id: this.userId()!,
            name: this.user()?.name || 'Unknown',
            email: this.user()?.email || ''
          }
        };

        // Agregar a la lista local
        this.posts.set([newPost, ...this.posts()]);

        Swal.fire({
          icon: 'success',
          title: 'Post created',
          text: 'Your post has been created successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
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
    const currentPosts = this.posts();
    const filteredPosts = currentPosts.filter(p => p.id !== postId);
    this.posts.set(filteredPosts);

    Swal.fire({
      icon: 'success',
      title: 'Deleted',
      text: 'Post deleted successfully',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
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
