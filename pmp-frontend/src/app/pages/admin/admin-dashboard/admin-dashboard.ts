import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Header } from '../_components/header/header';
import { Footer } from '../_components/footer/footer';
import { User } from '../_components/data-table/user/user';
import { PostDataTable } from '../_components/data-table/post/post';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Header, Footer, User, PostDataTable],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit, OnDestroy {
  currentTable: string = 'users';
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.currentTable = data['table'] || '';
    });

    // Also listen for route parameter changes
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.route.data.subscribe((data) => {
        this.currentTable = data['table'] || '';
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
