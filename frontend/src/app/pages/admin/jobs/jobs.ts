import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs {

  jobs:any[] = [
    {
      jobTitle: "Software Developer",
      jobDescription: "Backend development using Node.js",
      eligibility: "BCA / MCA",
      salary: 600000,
      applicationDeadline: "2026-03-20",
      company: { companyName: "Infosys" },
      applicants: []
    }
  ];

  job:any = this.createEmptyJob();

  editIndex:number | null = null;
  isModalOpen = false;


  createEmptyJob(){
    return {
      jobTitle:'',
      jobDescription:'',
      eligibility:'',
      salary:null,
      applicationDeadline:'',
      company:{ companyName:'' },
      applicants:[]
    };
  }


  openModal(){
    this.job = this.createEmptyJob();
    this.editIndex = null;
    this.isModalOpen = true;
  }


  closeModal(){
    this.isModalOpen = false;
  }


  saveJob(){

    if(this.editIndex !== null){

      this.jobs[this.editIndex] =
      JSON.parse(JSON.stringify(this.job));

    } 
    else{

      this.jobs.push(
        JSON.parse(JSON.stringify(this.job))
      );

    }

    this.closeModal();
  }


  editJob(index:number){

    this.job =
    JSON.parse(JSON.stringify(this.jobs[index]));

    this.editIndex = index;

    this.isModalOpen = true;

  }


  deleteJob(index:number){

    if(confirm("Are you sure you want to delete this job?")){
      this.jobs.splice(index,1);
    }

  }

}