  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Router, RouterModule } from '@angular/router';
  import { NavbarComponent } from '../../../components/navbar/navbar';
  import { PlacementService } from '../../../services/placement';

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

    constructor(private router: Router, private placementService: PlacementService) {}

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

      this.placementService.getStudentApplications(studentId).subscribe({
        next: (data: any) => {
          console.log('Applications data received:', data);
          const arrayData = Array.isArray(data) ? data : data?.data || [];
          this.applications = (Array.isArray(arrayData) ? arrayData : []).map(item => ({
            status: item?.status || 'Pending',
            appliedAt: item?.createdAt || item?.updatedAt || null,
            job: item?.job || {},
            company: item?.company || {},
            extra: item
          }));

          console.log('Mapped applications:', this.applications);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load applications', err);
          this.errorMessage = err?.error?.message || 'Unable to fetch your applications';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }

    formatDate(date: string | null): string {
      if (!date) return 'Unknown';
      return new Date(date).toLocaleString();
    }
  }
