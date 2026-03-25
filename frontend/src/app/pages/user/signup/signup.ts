import { Component, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ✅ ADD THIS

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {

  @ViewChild('formRef') formRef!: NgForm;

  form = {
    name: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  };

  errorMessage: string = '';
  passwordError: string = '';
  constructor(private router: Router, private http: HttpClient) {} // ✅ inject

  signup() {
  this.errorMessage = '';
  this.passwordError = '';

  this.formRef.form.markAllAsTouched();

  // 🚫 STOP if form invalid
  if (this.formRef.invalid) {
    return;
  }

  // Password mismatch
  if (this.form.password !== this.form.confirmPassword) {
    this.passwordError = "Passwords do not match";
    return;
  }

  const payload = {
    name: this.form.name,
    email: this.form.email,
    number: this.form.phone,
    address: this.form.address,
    password: this.form.password,
    cpassword: this.form.confirmPassword
  };

  this.http.post('http://localhost:5000/api/s/student/register', payload)
    .subscribe({
      next: (res: any) => {
        this.router.navigate(['/home']);
        this.formRef.resetForm();
      },
      error: (err) => {
        // ❌ DO NOT show raw error
        console.log("ERROR 👉", err);

        // ✅ Clean message only
        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Something went wrong';
        }
      }
    });
}
}