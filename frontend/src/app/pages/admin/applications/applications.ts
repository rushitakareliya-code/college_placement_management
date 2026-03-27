import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacementService } from '../../../services/placement';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
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
          job: item?.job?.role || 'Unknown Role',
          company: item?.company?.companyName || item?.job?.company || 'Unknown Company',
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
}