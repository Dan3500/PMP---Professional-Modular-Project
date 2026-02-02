import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PostModalComponent } from '../../post-modal/post-modal';
import { PostService, PostDTO } from '../../../../../core/services/post/post.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-post',
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
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'message',
    'creator',
    'read',
    'createdAt',
    'updatedAt',
    'active',
    'actions',
  ];
  dataSource = new MatTableDataSource<PostDTO>();
  isLoading = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  async loadPosts() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const posts = await firstValueFrom(this.postService.getPosts());
      this.dataSource.data = posts;
      console.log('posts :>> ', posts);
      console.log('this.dataSource.data :>> ', this.dataSource.data);
      this.isLoading = false;
    } catch (error: any) {
      console.error('Error loading posts:', error);
      this.errorMessage = 'Failed to load posts. Please try again.';
      this.isLoading = false;
    }
  }

  openEditDialog(post: PostDTO) {
    const dialogRef = this.dialog.open(PostModalComponent, {
      width: '500px',
      data: post,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update post in the table
        const index = this.dataSource.data.findIndex((p) => p.id === post.id);
        if (index !== -1) {
          const updatedData = [...this.dataSource.data];
          updatedData[index] = result;
          this.dataSource.data = updatedData;
        }
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(PostModalComponent, {
      width: '500px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Reload posts after creation
        this.loadPosts();
      }
    });
  }

  async deletePost(postId: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await firstValueFrom(this.postService.deletePost(postId));
        this.dataSource.data = this.dataSource.data.filter(
          (p) => p.id !== postId
        );
      } catch (error: any) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  }

  togglePostStatus(post: PostDTO): void {
    try {
      this.postService.activatePost(post.id).subscribe({
        next: (updatedPost) => {
          // Update the post in the table
          const index = this.dataSource.data.findIndex((p) => p.id === post.id);
          if (index !== -1) {
            const updatedData = [...this.dataSource.data];
            updatedData[index] = updatedPost;
            this.dataSource.data = updatedData;
          }
        },
        error: (error) => {
          console.error('Error updating post status:', error);
          alert('Failed to update post status. Please try again.');
        },
      });
    } catch (error: any) {
      console.error('Error toggling post status:', error);
      alert('Failed to toggle post status. Please try again.');
    }
  }

  togglePostRead(post: PostDTO): void {
    try {
      this.postService.setPostAsRead(post.id.toString(), !post.read).subscribe({
        next: (updatedPost) => {
          // Update the post in the table
          const index = this.dataSource.data.findIndex((p) => p.id === post.id);
          if (index !== -1) {
            const updatedData = [...this.dataSource.data];
            updatedData[index] = updatedPost;
            this.dataSource.data = updatedData;
          }
        },
        error: (error) => {
          console.error('Error updating post read status:', error);
          alert('Failed to update post read status. Please try again.');
        },
      });
    } catch (error: any) {
      console.error('Error toggling post read status:', error);
      alert('Failed to toggle post read status. Please try again.');
    }
  }
}

