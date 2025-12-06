import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterFormModel } from '../../../core/models/form/RegisterFormModel';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { ApiResponse } from '../../../core/models/API/ApiResponse';
import { FormsModule } from '@angular/forms';
import { RegisterResponse } from '../../../core/models/API/RegisterResponse';

@Component({
  selector: 'app-form-register',
  imports: [FormsModule],
  templateUrl: './form-register.html',
  styleUrl: './form-register.css',
})
export class FormRegister {
  email: string = '';
  password: string = '';
  name: string = '';
  repeated_email: string = '';
  repeated_password: string = '';
  email_error: boolean = false;
  email_repeated_error: boolean = false;
  password_error: boolean = false;
  password_repeated_error: boolean = false;

  errorMessage: string = '';

  patternEmail: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

  @Output() register = new EventEmitter<boolean>();

  constructor(private _authService: AuthService, private router: Router, private _route: ActivatedRoute) {}

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

    if (this.email !== this.repeated_email) {
      this.errorMessage = 'Emails do not match.';
      this.email_error = true;
      this.email_repeated_error = true;
      return;
    }

    if (this.password !== this.repeated_password) {
      this.errorMessage = 'Passwords do not match.';
      this.password_error = true;
      this.password_repeated_error = true;
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      this.password_error = true;
      return;
    }
      
    const registerRequest: RegisterFormModel = {
        email: this.email,
        name: this.name,
        password: this.password
      };

    /**
     * Call to AuthService to register the user with the provided credentials
     */
    try {
      const response: ApiResponse<RegisterResponse> = await firstValueFrom(
        this._authService.register(registerRequest)
      );
      
      this.register.emit(true);
      if (response.success === true){
        if (this._route.snapshot.routeConfig?.path == "register"){
          this.router.navigate(['/home']);
        }
      }

    } catch (error: any) {
      //Changes in the view after handled error in interceptor
      this.email_error = true;
      this.email_repeated_error = true;
      this.errorMessage = error.message;
    }
  }

  clearError() {
    this.email_error = false;
    this.email_repeated_error = false;
    this.password_repeated_error = false;
    this.password_error = false;
    this.errorMessage = '';
  }
}
