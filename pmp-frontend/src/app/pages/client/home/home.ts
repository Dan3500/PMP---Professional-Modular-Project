import { Component, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../_components/header/header';
import { Footer } from '../_components/footer/footer';
import { FormLogin } from '../../../shared/components/form-login/form-login';
import { AuthService } from '../../../core/services/auth.service';
import { FormRegister } from '../../../shared/components/form-register/form-register';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer, FormLogin, FormRegister],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

    auth = inject(AuthService);
    showLogin: boolean = false;
    showRegister: boolean = false;

  /**
   * Methods for toggle the login modal visibility
   */
  toggleLogin() {
    this.showLogin = !this.showLogin;
  }

  handleLogin(event: boolean) {
    if (event){
      this.showLogin = false;

      Swal.fire({
        icon: 'success',
        title: 'Logged in successfully!',
        toast: true,
        position: 'top-end',
        text: 'Welcome back!',
        showConfirmButton: false,   
        timer:1750,
        timerProgressBar: true,
      });
    }
  }
  
  /**
   * Methods for toggle the register modal visibility
   */
  toggleRegister() {
    this.showRegister = !this.showRegister;
  }

    onRegister(event: boolean) {
      if (event){
        this.showRegister = false;
          Swal.fire({
            icon: 'success',
            title: 'Registered successfully!',
            toast: true,
            position: 'top-end',
            text: 'User created successfully, you can now log in.',
            showConfirmButton: false,   
            timer:1750,
            timerProgressBar: true,
          });
      }
    }

}
