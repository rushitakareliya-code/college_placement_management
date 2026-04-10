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

  emailTaken: boolean = false;
  formError:string  = '';

  constructor(
  private companyService: CompanyService,
  private cdr: ChangeDetectorRef,
  private toastr: ToastrService

  ) {}

  // Pagination state
  currentPage: number = 1;
  itemsPerPage: number = 10;
  public Math = Math;

  // Search state
  searchQuery: string = '';

  onSearch() {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get filteredCompanies() {
    if (!this.searchQuery) return this.companies;
    const query = this.searchQuery.toLowerCase();
    return this.companies.filter(c => 
      c.companyName?.toLowerCase().includes(query) ||
      c.companyEmail?.toLowerCase().includes(query) ||
      c.companyLocation?.toLowerCase().includes(query)
    );
  }

  get paginatedCompanies() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCompanies.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredCompanies.length / this.itemsPerPage);
  }

  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

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
    this.emailTaken = false;
    this.formError = '';
  }

  closeModal() {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  saveCompany(form: NgForm) {
    // mark all fields as touched to show validation messages
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    // Prepare data to send
    const companyData = { ...this.company };
    // Backend currently requires companyPassword on add.
    if (this.editIndex === null) {
      companyData.companyPassword = 'Temp@1234';
    }

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
          const updated = updatedCompany?.company || updatedCompany;
          this.toastr.success('Company Details Updated Successfully!!');
          this.companies = this.companies.map((item, idx) => idx === this.editIndex ? updated : item);
          this.closeModal();
          this.loadCompanies();
        },
        error: handleError
      });
    } else {
      this.companyService.addCompany(companyData).subscribe({
        next: (createdCompany: any) => {
          const created = createdCompany?.company || createdCompany;
          this.toastr.success('Company Details Added successfully!!');
          this.companies = [created, ...this.companies];
          this.closeModal();
          this.loadCompanies();
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
    const confirmDelete = confirm('Are you sure you want to delete this company?');
    if (!confirmDelete) return;
    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        this.toastr.success('Company Deleted Successfully!!');
        this.companies = this.companies.filter((_, idx) => idx !== index);
        this.cdr.detectChanges();
        this.loadCompanies();
      },
      error: (err) => {
        console.error('Delete failed:', err);
      }
    });
  }
}