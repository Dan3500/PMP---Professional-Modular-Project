import { Component, inject, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header{
  
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }

  isAdmin() {
    console.log(this.auth.getRoles());
  }
  
}
