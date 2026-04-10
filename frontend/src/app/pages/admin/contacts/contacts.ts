import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-contacts',
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './contacts.html',
})
export class Contacts implements OnInit {
  contacts: any[] = [];
  isLoading = true;
  errorMessage = '';

  selectedContact: any = null;
  isResolveModalOpen = false;
  isViewModalOpen = false;

  // Pagination state
  currentPage: number = 1;
  itemsPerPage: number = 10;
  public Math = Math;

  // Search state
  searchQuery: string = '';

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.fetchContacts();
  }

  fetchContacts() {
    this.isLoading = true;
    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load contact requests.';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get filteredContacts() {
    if (!this.searchQuery) return this.contacts;
    const query = this.searchQuery.toLowerCase();
    return this.contacts.filter(c => 
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.message?.toLowerCase().includes(query)
    );
  }

  // Pagination Getters & Handlers
  get paginatedContacts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredContacts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredContacts.length / this.itemsPerPage);
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

  openResolveModal(contact: any) {
    this.selectedContact = contact;
    this.isResolveModalOpen = true;
    this.cdr.detectChanges();
  }

  closeResolveModal() {
    this.selectedContact = null;
    this.isResolveModalOpen = false;
    this.cdr.detectChanges();
  }

  confirmResolve() {
    if (!this.selectedContact) return;

    const contact = this.selectedContact;
    
    // Close modal instantly for better UX
    this.closeResolveModal();

    this.contactService.updateContactStatus(contact._id, 'resolved').subscribe({
      next: () => {
        contact.status = 'resolved';
        this.toastr.success('Contact request marked as resolved successfully!', 'Success');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('Failed to update status. Please try again.', 'Error');
        console.error(error);
      }
    });
  }

  openViewModal(contact: any) {
    this.selectedContact = contact;
    this.isViewModalOpen = true;
    this.cdr.detectChanges();
  }

  closeViewModal() {
    this.selectedContact = null;
    this.isViewModalOpen = false;
    this.cdr.detectChanges();
  }
}
