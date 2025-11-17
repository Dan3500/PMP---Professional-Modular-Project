import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-login',
  imports: [FormsModule],
  templateUrl: './form-login.html',
  styleUrl: './form-login.css',
})
export class FormLogin {
  email: string = '';
  password: string = '';

  @Output() login = new EventEmitter<{ email: string; password: string }>();

  onSubmit() {
    if (this.email && this.password) {
      this.login.emit({ email: this.email, password: this.password });
    }
  }
}
