import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../_components/header/header';
import { Footer } from '../_components/footer/footer';
import { FormLogin } from '../../../shared/components/form-login/form-login';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer, FormLogin],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  showLogin: boolean = false;

  toggleLogin() {
    this.showLogin = !this.showLogin;
  }

  handleLogin(EventEmitter: any) {
    this.showLogin = false; 
  }
}
