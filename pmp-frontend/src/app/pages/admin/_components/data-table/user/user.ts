import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserModalComponent } from '../../user-modal/user-modal';
import { UserService, UserDTO } from '../../../../../core/services/user/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user',
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'roles',
    'createdAt',
    'updatedAt',
    'isActive',
    'actions',
  ];
  dataSource = new MatTableDataSource<UserDTO>();
  isLoading = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  async loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const users = await firstValueFrom(this.userService.getUsers());
      this.dataSource.data = users;
      this.isLoading = false;
    } catch (error: any) {
      console.error('Error loading users:', error);
      this.errorMessage = 'Failed to load users. Please try again.';
      this.isLoading = false;
    }
  }

  openEditDialog(user: UserDTO) {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '500px',
      data: user,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update user in the table
        const index = this.dataSource.data.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          const updatedData = [...this.dataSource.data];
          updatedData[index] = result;
          this.dataSource.data = updatedData;
        }
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '500px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Reload users after creation
        this.loadUsers();
      }
    });
  }

  async deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await firstValueFrom(this.userService.deleteUser(userId));
        this.dataSource.data = this.dataSource.data.filter(
          (u) => u.id !== userId
        );
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  }

  toggleUserStatus(user: UserDTO): void {
    try {
      this.userService.activateUser(user.id).subscribe({
        next: (updatedUser) => {
          // Update the user in the table
          const index = this.dataSource.data.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            const updatedData = [...this.dataSource.data];
            updatedData[index] = updatedUser;
            this.dataSource.data = updatedData;
          }
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          alert('Failed to update user status. Please try again.');
        },
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      alert('Failed to toggle user status. Please try again.');
    }
  }
}
