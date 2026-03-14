import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class Jobs {

  jobs:any[] = [
    {
      title: "Software Developer",
      company: "Infosys",
      package: "6 LPA",
      deadline: "20 March"
    }
  ];

  job:any = {
    title:'',
    company:'',
    package:'',
    deadline:''
  };

  editIndex:number | null = null;
  isModalOpen = false;

  openModal(){
    this.job = {title:'', company:'', package:'', deadline:''};
    this.editIndex = null;
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
  }

  saveJob(){

    if(this.editIndex !== null){
      this.jobs[this.editIndex] = {...this.job};
    } 
    else{
      this.jobs.push({...this.job});
    }

    this.closeModal();
  }

  editJob(index:number){
    this.job = {...this.jobs[index]};
    this.editIndex = index;
    this.isModalOpen = true;
  }

  deleteJob(index:number){
    if(confirm("Are you sure you want to delete this job?")){
      this.jobs.splice(index,1);
    }
  }

}