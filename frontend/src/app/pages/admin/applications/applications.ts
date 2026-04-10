import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacementService } from '../../../services/placement';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {

  isLoading = false;
  errorMessage = '';
  applications:any[] = [];

  selectedApplication:any = null;
  isModalOpen = false;
  constructor(
    private placementService: PlacementService, 
    private cdr: ChangeDetectorRef
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

  get filteredApplications() {
    if (!this.searchQuery) return this.applications;
    const query = this.searchQuery.toLowerCase();
    return this.applications.filter(a => 
      a.student?.toLowerCase().includes(query) ||
      a.job?.toLowerCase().includes(query) ||
      a.company?.toLowerCase().includes(query)
    );
  }

  get paginatedApplications() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredApplications.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredApplications.length / this.itemsPerPage);
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

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading = true;
    this.errorMessage = '';
    this.placementService.getAllApplications()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
      next: (data: any) => {
        const rows = Array.isArray(data)
          ? data
          : (Array.isArray(data?.data) ? data.data : []);
        this.applications = rows.map((item: any) => ({
          ...item,
          student: item?.student?.name || item?.fullName || 'Unknown',
          studentEmail: item?.student?.email || item?.email || '—',
          job: item?.job?.role || item?.jobTitle || 'Unknown Role',
          company: item?.company?.companyName || item?.job?.company || item?.jobCompany || 'Unknown Company',
          status: item?.status === 'Selected' ? 'Approved' : (item?.status || 'Pending')
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to fetch applications';
        this.cdr.detectChanges();
      }
    });
  }

  viewApplication(app:any){
    this.selectedApplication = app;
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
  }

  updateStatus(status:string){
    if (!this.selectedApplication?._id) {
      this.selectedApplication.status = status;
      this.closeModal();
      return;
    }

    const backendStatus = status === 'Approved' ? 'Selected' : status;
    this.placementService.updateApplicationStatus(this.selectedApplication._id, backendStatus as any).subscribe({
      next: (updated: any) => {
        const uiStatus = updated?.status === 'Selected' ? 'Approved' : (updated?.status || status);
        this.applications = this.applications.map((app: any) =>
          app._id === this.selectedApplication._id ? { ...app, status: uiStatus } : app
        );
        this.selectedApplication.status = uiStatus;
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.closeModal();
      }
    });
  }

  updateRowStatus(app: any, status: string, event: Event) {
    event.stopPropagation();
    const backendStatus = status === 'Approved' ? 'Selected' : status;
    this.placementService.updateApplicationStatus(app._id, backendStatus as any).subscribe({
      next: (updated: any) => {
        const uiStatus = updated?.status === 'Selected' ? 'Approved' : (updated?.status || status);
        this.applications = this.applications.map((a: any) =>
          a._id === app._id ? { ...a, status: uiStatus } : a
        );
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getResumeUrl(resumePath: string): string {
    if (!resumePath) return '';
    // Extract filename from absolute path or relative path
    const parts = resumePath.split(/[\\/]/);
    const filename = parts[parts.length - 1];
    return `http://localhost:5000/uploads/resumes/${filename}`;
  }
}