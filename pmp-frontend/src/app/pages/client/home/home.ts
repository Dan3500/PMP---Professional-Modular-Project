import { Component, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../_components/header/header';
import { Footer } from '../_components/footer/footer';
import { FormLogin } from '../../../shared/components/form-login/form-login';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer, FormLogin],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  auth = inject(AuthService);
  showLogin: boolean = false;

  /**
   * Methods for toggle the login modal visibility
   */
  toggleLogin() {
    this.showLogin = !this.showLogin;
  }

  handleLogin(event: boolean) {
    if (event){
      this.showLogin = false;
    }
  }
  
}
