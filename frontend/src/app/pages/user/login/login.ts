import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../../components/navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;

  form = {
    email: '',
    password: ''
  };

  emailError = '';
  passwordError = '';
  commonError = '';
  isLoading = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  login() {
    // Reset previous errors
    this.emailError = '';
    this.passwordError = '';
    this.commonError = '';
    this.loginForm.form.markAllAsTouched();

    if (!this.loginForm.valid) return;

    this.isLoading = true;

    this.http.post('http://localhost:5000/api/s/student/login', this.form)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          // Store token & user
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          // Navigate
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;

          const message = err?.error?.message || '';

          // Detect errors
          const emailMsg = message.toLowerCase().includes('email') ? message : '';
          const passwordMsg = message.toLowerCase().includes('password') ? message : '';

          // Both wrong → set common error
          if (emailMsg && passwordMsg) {
            this.commonError = 'Invalid credentials';
          } else if (emailMsg) {
            this.emailError = emailMsg;
          } else if (passwordMsg) {
            this.passwordError = passwordMsg;
          } else {
            // fallback
            this.commonError = message || 'Login failed';
          }

          this.cdr.detectChanges();
        }
      });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}