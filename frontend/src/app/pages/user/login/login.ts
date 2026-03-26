import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
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
  authError = '';
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
    this.authError = '';

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

          // Navigate to home
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;

          const message = err?.error?.message || 'Login failed';

          const status = err?.status;
          const isCredentialError = message.toLowerCase().includes('email') || message.toLowerCase().includes('password');

          if (status === 401 || isCredentialError) {
            this.authError = message;
          } else {
            this.commonError = message;
          }

          this.cdr.detectChanges();
        }
      });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}