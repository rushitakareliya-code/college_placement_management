import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CompanyService } from '../../../services/company';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './companies.html',
  styleUrls: ['./companies.css'],
})
export class Companies implements OnInit {

  companies: any[] = [];
  company: any = this.createEmptyCompany();
  editIndex: number | null = null;
  isModalOpen = false;

  passwordMismatch: boolean = false;
  emailTaken: boolean = false;
  formError:string  = '';

constructor(
  private companyService: CompanyService,
  private cdr: ChangeDetectorRef,
  private toastr: ToastrService

) {}

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (data: any) => {
        console.log('Companies:', data);
        this.companies = data;

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  createEmptyCompany() {
    return {
      companyName: '',
      companyEmail: '',
      companyPassword: '',
      companyConfirmPassword: '', 
      companyPhone: '',
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
    this.passwordMismatch = false;
    this.emailTaken = false;
    this.formError = '';
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCompany(form: NgForm) {
    // mark all fields as touched to show validation messages
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    // check password match
    if (this.company.companyPassword !== this.company.companyConfirmPassword) {
      this.passwordMismatch = true;
      return;
    } else {
      this.passwordMismatch = false;
    }

    // Prepare data to send (remove confirm password)
    const companyData = { ...this.company };
    delete companyData.companyConfirmPassword;

    const handleError = (err: any) => {
      console.error('Save failed', err);

      // Handle validation errors from backend
      if (err.status === 400 && err.error?.message) {
        // Example: email already taken
        if (err.error.message.toLowerCase().includes('email')) {
          this.emailTaken = true; // Add this property in your component
        } else {
          this.formError = err.error.message; // generic form error
        }
      } else {
        this.formError = 'Something went wrong. Please try again!';
      }
    };

    if (this.editIndex !== null) {
      const id = this.companies[this.editIndex]._id;
      this.companyService.updateCompany(id, companyData).subscribe({
        next: (updatedCompany: any) => {
          this.toastr.success('Company Details Updated Successfully!!');
          this.companies[this.editIndex!] = updatedCompany;
          this.closeModal();
        },
        error: handleError
      });
    } else {
      this.companyService.addCompany(companyData).subscribe({
        next: (createdCompany: any) => {
          this.toastr.success('Company Details Added successfully!!');
          this.companies = [createdCompany, ...this.companies];
          this.closeModal();
        },
        error: handleError
      });
    }
  }

  editCompany(index: number) {
    const selected = this.companies[index];

    this.company = {
      companyName: selected.companyName,
      companyEmail: selected.companyEmail,
      companyPhone: selected.companyPhone,
      companyDescription: selected.companyDescription,
      companyWebsite: selected.companyWebsite,
      companyLocation: selected.companyLocation,
      companyDifficulty: selected.companyDifficulty
    };

    this.editIndex = index;
    this.isModalOpen = true;
  }

  deleteCompany(index: number) {
    const id = this.companies[index]?._id;

    if (!id) {
      console.error('ID not found');
      return;
    }
    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        this.toastr.success('Company Deleted Successfully!!');
        this.companies.splice(index, 1);
      },
      error: (err) => {
        console.error('Delete failed:', err);
      }
    });
  }
}