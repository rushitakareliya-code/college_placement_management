import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {

  form = {
    email: '',
    password: ''
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  loginAdmin() {

    this.http.post('http://localhost:5000/api/auth/admin/login', this.form)
      .subscribe((res: any) => {

        localStorage.setItem('token', res.token);

        this.toastr.success('Login successful!!', 'Success');

        this.router.navigate(['/admin/dashboard']);

      }, error => {

        this.toastr.error('Invalid email or password', 'Login Failed');

      });

  }

}
