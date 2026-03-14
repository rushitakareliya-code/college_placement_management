import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications {

  applications:any[] = [
    {
      student: 'Rahul',
      job: 'Web Developer',
      company: 'TCS',
      status: 'Pending'
    }
  ];

  selectedApplication:any = null;
  isModalOpen = false;

  viewApplication(app:any){
    this.selectedApplication = app;
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
  }

  updateStatus(status:string){
    this.selectedApplication.status = status;
    this.closeModal();
  }

}