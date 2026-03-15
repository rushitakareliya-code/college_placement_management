import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar';


@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.css']
})
export class JobDetailComponent {

  showSuccess = false;

  job = {
    role: "Frontend Developer",
    company: "Google",
    location: "Bangalore",
    type: "Hybrid",
    experience: "1-3 years",
    workingDays: "Monday - Friday",
    weekOff: "Saturday, Sunday",
    shift: "10 AM - 6 PM",
    salary: "8 - 12 LPA",
    description: "We are looking for a skilled Frontend Developer to build modern, scalable user interfaces using Angular.",
    responsibilities: [
      "Develop responsive UI using Angular",
      "Collaborate with backend teams",
      "Optimize application performance",
      "Write reusable components"
    ],
    requirements: [
      "Strong knowledge of HTML, CSS, JavaScript",
      "Experience with Angular framework",
      "Understanding of REST APIs",
      "Good problem solving skills"
    ]
  };

  applyJob() {

    this.showSuccess = true;

    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);

  }

}