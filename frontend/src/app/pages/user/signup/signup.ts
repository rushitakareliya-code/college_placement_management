import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, NavbarComponent],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {

  form = {
    name: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  };

  signup() {

    if (this.form.password !== this.form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log(this.form);

    alert("Signup successful");

    // Reset form
    this.form = {
      name: '',
      phone: '',
      email: '',
      address: '',
      password: '',
      confirmPassword: ''
    };

  }

}