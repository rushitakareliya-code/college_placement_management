import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JobApplicationFormComponent } from '../../job-application-form/job-application-form';

interface Job {
  _id: string;
  role?: string;
  company?: string;
  companyId?: any;
  location?: string;
  type?: string;
  experience?: string;
  salary?: string;
  workingDays?: string;
  weekOff?: string;
  shift?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  deadline?: string;
}

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HttpClientModule, JobApplicationFormComponent],
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.css']
})
export class JobDetail implements OnInit {

  job: Job | null = null;
  showSuccess = false;
  jobId = '';
  isLoading = true;
  errorMessage = '';

  // Application form
  showApplicationForm = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone   // ✅ FIX: Added NgZone
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      console.log("🔁 Route changed");
      this.jobId = params.get('id') || '';
      console.log("New Job ID:", this.jobId);

      if (this.jobId) {
        this.loadJobDetails();
      }
    });
  }

  loadJobDetails() {
    this.isLoading = true;
    this.errorMessage = '';
    this.job = null;

    console.log("Calling API with ID:", this.jobId);

    this.http.get<any>(`http://localhost:5000/api/jobs/${this.jobId}`)
      .subscribe({
        next: (res) => {
          console.log("✅ RAW API RESPONSE:", res);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let isExpired = false;
          if (res.deadline) {
            const deadlineDate = new Date(res.deadline);
            deadlineDate.setHours(0, 0, 0, 0);
            if (deadlineDate.getTime() < today.getTime()) {
              isExpired = true;
            }
          }

          if (res.isActive === false || isExpired) {
            this.errorMessage = 'This job is no longer available or the deadline has passed.';
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          this.job = res;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("❌ API ERROR:", err);
          this.errorMessage = 'Job not found or failed to load';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  applyJob() {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!this.job || !token || !userRaw) {
      this.router.navigate(['/login']);
      return;
    }

    this.showApplicationForm = true;
  }

  onApplicationSubmitted() {
    this.showApplicationForm = false;
    this.showSuccess = true;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.ngZone.run(() => {
        this.showSuccess = false;
        this.cdr.detectChanges();
      });
    }, 3000);
  }

  onApplicationFormClosed() {
    this.showApplicationForm = false;
  }
}