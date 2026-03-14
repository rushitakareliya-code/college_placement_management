import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './companies.html',
  styleUrls: ['./companies.css'],
})
export class Companies {

  companies: any[] = [
    {
      companyName: 'TCS',
      companyDescription: 'Leading IT services company',
      companyWebsite: 'https://www.tcs.com',
      companyLocation: 'Mumbai',
      companyDifficulty: 'Moderate'
    }
  ];


  company: any = this.createEmptyCompany();

  editIndex: number | null = null;

  isModalOpen = false;


  createEmptyCompany() {

    return {
      companyName: '',
      companyDescription: '',
      companyWebsite: '',
      companyLocation: '',
      companyDifficulty: ''
    };

  }


  openModal() {

    this.company = this.createEmptyCompany();

    this.editIndex = null;

    this.isModalOpen = true;

  }


  closeModal() {

    this.isModalOpen = false;

  }


  saveCompany() {

    const data = JSON.parse(JSON.stringify(this.company));

    if (this.editIndex !== null) {

      this.companies[this.editIndex] = data;

    } else {

      this.companies.push(data);

    }

    this.closeModal();

  }


  editCompany(index: number) {

    this.company = JSON.parse(JSON.stringify(this.companies[index]));

    this.editIndex = index;

    this.isModalOpen = true;

  }


  deleteCompany(index: number) {

    if (confirm("Are you sure you want to delete this company?")) {

      this.companies.splice(index, 1);

    }

  }

}