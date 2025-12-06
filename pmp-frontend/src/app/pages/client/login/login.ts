import { Component } from '@angular/core';
import { FormLogin } from '../../../shared/components/form-login/form-login';

@Component({
  selector: 'app-login',
  imports: [FormLogin],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  onLogin(isLoggedIn: boolean) {
    
  }
}
