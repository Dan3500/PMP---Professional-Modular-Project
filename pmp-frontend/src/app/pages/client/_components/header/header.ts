import { Component, inject, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header{
  
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
  }

  isAdmin() {
    return this.auth.hasRole('ADMIN');
  }

  goToProfile() {
    const user = this.auth.getUser();
    console.log('user :>> ', user);
    if (user?.id) {
      this.router.navigate(['/profile', user.id]);
    }
  }
  
}
