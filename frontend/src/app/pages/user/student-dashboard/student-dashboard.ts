import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { PlacementService } from '../../../services/placement';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {
  isLoading = false;
  errorMessage = '';
  applications: any[] = [];
  studentName = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;

  // Modal
  isModalOpen = false;
  selectedJob: any = null;

  constructor(
    private router: Router,
    private placementService: PlacementService,
    private cdr: ChangeDetectorRef
  ) { }

  protected readonly Math = Math;

  ngOnInit(): void {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userRaw);
    if (!user?.id && !user?._id) {
      this.router.navigate(['/login']);
      return;
    }

    const studentId = user.id || user._id;
    this.studentName = user.name || 'Student';

    this.loadApplications(studentId);
  }

  loadApplications(studentId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading applications for studentId:', studentId);

    this.placementService.getStudentApplications(studentId)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data: any) => {
          console.log('Applications data received:', data);
          const arrayData = Array.isArray(data)
            ? data
            : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.placements) ? data.placements : []));
          this.applications = (Array.isArray(arrayData) ? arrayData : [])
            .filter(item => !!item)
            .map(item => ({
              status: item?.status || 'Pending',
              appliedAt: item?.createdAt || item?.updatedAt || null,
              job: item?.job || {},
              company: item?.company || {},
              extra: item
            }));

          console.log('Mapped applications:', this.applications);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load applications', err);
          this.errorMessage = err?.error?.message || 'Unable to fetch your applications';
          this.cdr.detectChanges();
        }
      });
  }

  // Stats Getters
  get totalApps(): number {
    return this.applications.length;
  }

  get pendingApps(): number {
    return this.applications.filter(a => a.status === 'Pending').length;
  }

  get shortlistedApps(): number {
    return this.applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length;
  }

  get rejectedApps(): number {
    return this.applications.filter(a => a.status === 'Rejected').length;
  }

  // Pagination Getters
  get totalPages(): number {
    return Math.ceil(this.applications.length / this.itemsPerPage);
  }

  get paginatedApplications(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.applications.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  // Modal Methods
  openJobModal(app: any): void {
    this.selectedJob = { ...app.job, status: app.status };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeJobModal(): void {
    this.isModalOpen = false;
    this.selectedJob = null;
    this.cdr.detectChanges();
  }

  formatDate(date: string | null): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  }
}
