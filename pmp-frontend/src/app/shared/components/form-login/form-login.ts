import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginFormModel } from '../../../core/models/form/LoginFormModel';
import { ApiResponse } from '../../../core/models/API/ApiResponse';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { LoginResponse } from '../../../core/models/API/LoginResponse';

@Component({
  selector: 'app-form-login',
  imports: [FormsModule],
  templateUrl: './form-login.html',
  styleUrl: './form-login.css',
})
export class FormLogin {
  email: string = '';
  password: string = '';

  email_error: boolean = false;
  password_error: boolean = false;
  errorMessage: string = '';

  patternEmail: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

  @Output() login = new EventEmitter<boolean>();

  constructor(private _authService: AuthService, private router: Router) {}

  /**
   * Method to handle the form submission for user login
   * @returns manages the user Login if successful, sets errorMessage if failed
   */
  async onSubmit() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      this.email_error = true;
      this.password_error = true;
      return;
    }

    if (!this.email.match(this.patternEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      this.email_error = true;
      return;
    }
      
    const loginRequest: LoginFormModel = {
        email: this.email,
        password: this.password
      };

    /**
     * Call to AuthService to perform login
     */
    try {
      const response: ApiResponse<LoginResponse> = await firstValueFrom(
        this._authService.login(loginRequest)
      );

      this._authService.setToken(response.data!.token);
      this._authService.setUser(response.data!.user);
      this.router.navigate(['/home']);
      this.login.emit(true);

    } catch (error: any) {
      //Changes in the view after handled error in interceptor
      this.email_error = true;
      this.password_error = true;
      this.errorMessage = error.message;
    }
    
  }

  clearError() {
    this.errorMessage = '';
    this.email_error = false;
    this.password_error = false;
  }
}



