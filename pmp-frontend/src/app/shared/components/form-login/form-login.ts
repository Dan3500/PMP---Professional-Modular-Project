import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginFormModel } from '../../../core/models/form/LoginFormModel';
import { AuthToken } from '../../../core/models/AuthToken';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-login',
  imports: [FormsModule],
  templateUrl: './form-login.html',
  styleUrl: './form-login.css',
})
export class FormLogin {
  email: string = '';
  password: string = '';

  errorMessage: string = '';

  patternEmail: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

  @Output() login = new EventEmitter<boolean>();

  constructor(private _authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    if (!this.email.match(this.patternEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    const loginRequest: LoginFormModel = {
      email: this.email,
      password: this.password
    };

    this._authService.login(loginRequest).subscribe(
      (response: AuthToken) => {
        this._authService.setToken(response.token);
        this.router.navigate(['/home']);
        this.login.emit(true);
      },
      (error) => {
        console.error('error :>> ', error);
        this.errorMessage = 'Invalid email or password.';
      }
    );
  }
}
