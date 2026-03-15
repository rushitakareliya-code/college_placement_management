import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NavbarComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  form = {
    email: '',
    password: ''
  };

  constructor(private router: Router) {}

  login() {

    console.log("Login data:", this.form);

    // simulate login
    localStorage.setItem('token', 'demo-token');

    alert("Login successful");

    // redirect to home page
    this.router.navigate(['/home']);
  }

}