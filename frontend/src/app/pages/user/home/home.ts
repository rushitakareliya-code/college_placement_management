import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar';

interface JobSummary {
  _id: string; // job ID for backend fetch
  role: string;
  company: string;
  location: string;
  exp: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  constructor(private router: Router) {}

 jobs: JobSummary[] = [
    {_id: "69bfb9472396cb4951738cf9", role:"Full Stack Developer", company:"Tata Consultancy Services", location:"Bangalore, Karnataka", exp:"2-5 years"},
    {_id: "69bfbdae2396cb4951738cfd", role:"Data Analyst", company:"Accenture", location:"Mumbai, Maharashtra", exp:"1-3 years"},
    {_id: "69bfbe102396cb4951738d01", role:"Frontend Developer", company:"Google", location:"Bangalore", exp:"0-2 yrs"},
    {_id: "69bfbe172396cb4951738d03", role:"Backend Engineer", company:"Amazon", location:"Hyderabad", exp:"2-4 yrs"},
    {_id: "69bfbdf22396cb4951738cff", role:"DevOps Engineer", company:"Microsoft", location:"Pune", exp:"1-3 yrs"},
    {_id: "69bfbe462396cb4951738d05", role:"QA Engineer", company:"Flipkart", location:"Remote", exp:"2-5 yrs"},
    {_id: "69bfbe552396cb4951738d07", role:"Business Analyst", company:"Infosys", location:"Chennai", exp:"1-2 yrs"},
    {_id: "69bfbe612396cb4951738d09", role:"Cloud Architect", company:"TCS", location:"Mumbai", exp:"2-3 yrs"},
    {_id: "69bfbe6e2396cb4951738d0b", role:"Mobile App Developer", company:"Wipro", location:"Delhi", exp:"1-3 yrs"},
    {_id: "69bfbe7b2396cb4951738d0d", role:"Cybersecurity Analyst", company:"Adobe", location:"Bangalore", exp:"0-1 yrs"},
    {_id: "69bfbe8e2396cb4951738d0f", role:"UI/UX Designer", company:"IBM", location:"Pune", exp:"3-5 yrs"},
    {_id: "69bfbe9a2396cb4951738d11", role:"Product Manager", company:"Oracle", location:"Hyderabad", exp:"2-4 yrs"},
    {_id: "69bfbea72396cb4951738d13", role:"Blockchain Developer", company:"Swiggy", location:"Remote", exp:"1-2 yrs"},
    {_id: "69bfbeb22396cb4951738d15", role:"AI/ML Engineer", company:"Zomato", location:"Gurgaon", exp:"3-6 yrs"},
    {_id: "69bfbebc2396cb4951738d17", role:"Salesforce Developer", company:"Capgemini", location:"Noida", exp:"1-3 yrs"}
  ];

  openJob(id: string) {
    this.router.navigate(['/job', id]);
  }

  scrollToJobs() {
    const section = document.getElementById("jobsSection");
    section?.scrollIntoView({ behavior: 'smooth' });
  }

}