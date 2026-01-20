import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../../../core/services/user/user.service';
import { firstValueFrom } from 'rxjs';

interface UserDTO {
  id?: string;
  name: string;
  email: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css',
})
export class UserModalComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  availableRoles = ['ROLE_USER', 'ROLE_ADMIN'];

  constructor(
    public dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDTO | null,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.isEditMode = !!this.data;
    this.initializeForm();
  }

  private initializeForm() {
    this.form = this.fb.group({
      name: [this.data?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      roles: [this.data?.roles || ['ROLE_USER'], Validators.required],
      password: [this.data ? '' : '', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      isActive: [this.data?.isActive || false],
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
          // Edit mode: call updateUser service
          const updatedUser = await firstValueFrom(
            this.userService.updateUser(this.data!.id!, {
              name: formData.name,
              email: formData.email,
              password: formData.password || undefined,
              roles: formData.roles,
              is_active: formData.isActive,
            })
          );
          this.dialogRef.close(updatedUser);
        } else {
          // Create mode: call createUser service
          const newUser = await firstValueFrom(
            this.userService.createUser({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: formData.roles,
            })
          );
          this.dialogRef.close(newUser);
        }
      } catch (error) {
        console.error('Error saving user:', error);
        // Optionally, handle error display to the user here
      }
    }
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Create User';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update' : 'Create';
  }
}
