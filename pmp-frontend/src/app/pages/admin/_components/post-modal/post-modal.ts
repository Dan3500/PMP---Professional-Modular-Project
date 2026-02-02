import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { PostService } from '../../../../core/services/post/post.service';
import { UserService, UserDTO } from '../../../../core/services/user/user.service';
import { firstValueFrom } from 'rxjs';

interface PostDTO {
  id?: string;
  name: string;
  message: string;
  read: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: any;
}

@Component({
  selector: 'app-post-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './post-modal.html',
  styleUrl: './post-modal.css',
})
export class PostModalComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  users: UserDTO[] = [];
  isLoadingUsers = false;
  isFormReady = false;

  constructor(
    public dialogRef: MatDialogRef<PostModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostDTO | null,
    private fb: FormBuilder,
    private postService: PostService,
    private userService: UserService
  ) {
    // Initialize form as empty to avoid undefined errors
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      creatorId: ['', Validators.required],
      read: [false],
      active: [true],
    });
  }

  ngOnInit() {
    this.isEditMode = !!this.data;
    this.loadUsers();
  }

  async loadUsers() {
    this.isLoadingUsers = true;
    try {
      this.users = await firstValueFrom(this.userService.getUsers());
      // Initialize form after loading users
      this.initializeForm();
    } catch (error) {
      console.error('Error loading users:', error);
      // Initialize form even if loading fails
      this.initializeForm();
    } finally {
      this.isLoadingUsers = false;
      this.isFormReady = true;
    }
  }

  private initializeForm() {
    const readValue = this.data?.read !== undefined ? this.data.read : false;
    const activeValue = this.data?.active !== undefined ? this.data.active : true;
    const creatorId = this.data?.creator?.id ? this.data.creator.id.toString() : '';

    this.form.patchValue({
      name: this.data?.name || '',
      message: this.data?.message || '',
      creatorId: creatorId,
      read: readValue,
      active: activeValue,
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      
      try {
        if (this.isEditMode) {
          // Edit mode: call updatePost service
          const updatedPost = await firstValueFrom(
            this.postService.updatePost(this.data!.id!, {
              name: formData.name,
              message: formData.message,
              read: formData.read,
              active: formData.active,
              creatorId: formData.creatorId,
            })
          );
          this.dialogRef.close(updatedPost);
        } else {
          // Create mode: call createPost service
          const newPost = await firstValueFrom(
            this.postService.createPost({
              name: formData.name,
              message: formData.message,
              creatorId: formData.creatorId,
            })
          );
          this.dialogRef.close(newPost);
        }
      } catch (error) {
        console.error('Error saving post:', error);
        // Optionally, handle error display to the user here
      }
    }
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Post' : 'Create Post';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update' : 'Create';
  }
}
