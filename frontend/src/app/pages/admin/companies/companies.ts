import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './companies.html',
  styleUrl: './companies.css',
})
export class Companies {

  companies:any[] = [
    {
      name: 'TCS',
      email: 'tcs@mail.com',
      location: 'Mumbai'
    }
  ];

  company:any = {
    name:'',
    email:'',
    location:''
  };

  editIndex:number | null = null;
  isModalOpen = false;

  openModal(){
    this.company = {name:'', email:'', location:''};
    this.editIndex = null;
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
  }

  saveCompany(){

    if(this.editIndex !== null){
      this.companies[this.editIndex] = {...this.company};
    } 
    else{
      this.companies.push({...this.company});
    }

    this.closeModal();
  }

  editCompany(index:number){
    this.company = {...this.companies[index]};
    this.editIndex = index;
    this.isModalOpen = true;
  }

  deleteCompany(index:number){
    if(confirm("Are you sure you want to delete this company?")){
      this.companies.splice(index,1);
    }
  }

}