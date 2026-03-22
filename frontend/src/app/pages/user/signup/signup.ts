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
    confirmPassword: ''
  };

  constructor(private router: Router, private http: HttpClient) {} // ✅ inject

  signup() {
    console.log("Signup clicked");

    this.formRef.form.markAllAsTouched();

    // ❌ Stop if invalid
    if (!this.formRef.valid) {
      alert("Please fill all fields correctly");
      return;
    }

    // ❌ Password mismatch
    if (this.form.password !== this.form.confirmPassword) {
      alert("Passwords do not match");
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

    // ✅ API CALL
    this.http.post('http://localhost:5000/api/s/student/register', payload)
      .subscribe({
        next: (res: any) => {
          console.log("API called successfully", res);

          // ✅ Navigate ONLY after success
          this.router.navigate(['/home']);

          // ✅ Reset form
          this.formRef.resetForm();
        },
       error: (err) => {
  console.log("FULL ERROR OBJECT 👉", err);
  console.log("ERROR MESSAGE 👉", err.error);
  alert(JSON.stringify(err.error)); // 👈 show real backend error
}
      });
  }
}