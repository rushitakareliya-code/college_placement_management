import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  constructor(private router: Router) {}

  jobs = [
    {id:1, role:"Frontend Developer", company:"Google", location:"Bangalore", exp:"0-2 yrs"},
    {id:2, role:"Backend Engineer", company:"Amazon", location:"Hyderabad", exp:"2-4 yrs"},
    {id:3, role:"Software Engineer", company:"Microsoft", location:"Pune", exp:"1-3 yrs"},
    {id:4, role:"Full Stack Developer", company:"Flipkart", location:"Remote", exp:"2-5 yrs"},
    {id:5, role:"Angular Developer", company:"Infosys", location:"Chennai", exp:"1-2 yrs"},
    {id:6, role:"React Developer", company:"TCS", location:"Mumbai", exp:"2-3 yrs"},
    {id:7, role:"Node Developer", company:"Wipro", location:"Delhi", exp:"1-3 yrs"},
    {id:8, role:"UI Developer", company:"Adobe", location:"Bangalore", exp:"0-1 yrs"},
    {id:9, role:"Software Developer", company:"IBM", location:"Pune", exp:"3-5 yrs"},
    {id:10, role:"Backend Developer", company:"Oracle", location:"Hyderabad", exp:"2-4 yrs"},
    {id:11, role:"Frontend Engineer", company:"Swiggy", location:"Remote", exp:"1-2 yrs"},
    {id:12, role:"Fullstack Engineer", company:"Zomato", location:"Gurgaon", exp:"3-6 yrs"},
    {id:13, role:"Java Developer", company:"Capgemini", location:"Noida", exp:"1-3 yrs"},
    {id:14, role:"Python Developer", company:"Paytm", location:"Delhi", exp:"2-4 yrs"},
    {id:15, role:"Cloud Engineer", company:"Accenture", location:"Bangalore", exp:"2-5 yrs"}
  ];

  openJob(id:number){
    this.router.navigate(['/job',id]);
  }
  scrollToJobs() {
  const section = document.getElementById("jobsSection");
  section?.scrollIntoView({ behavior: 'smooth' });
}

}