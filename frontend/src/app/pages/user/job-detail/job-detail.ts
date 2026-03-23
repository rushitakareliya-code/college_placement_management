import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
}

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HttpClientModule],
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.css']
})
export class JobDetail implements OnInit {
  job: Job | null = null;
  showSuccess = false;
  jobId = '';
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef  // ✅ FIX 1: Force change detection
  ) {}

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
    this.job = null;  // ✅ FIX 2: Reset job

    console.log("Calling API with ID:", this.jobId);

    this.http.get<any>(`http://localhost:5000/api/jobs/${this.jobId}`)
      .subscribe({
        next: (res) => {
          console.log("✅ RAW API RESPONSE:", res);
          this.job = res;
          this.isLoading = false;
          this.cdr.detectChanges();  // ✅ FIX 3: Force UI update
          console.log("✅ JOB ASSIGNED:", this.job);
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

    const studentData = JSON.parse(userRaw || '{}');
    const studentId = studentData.id || studentData._id;
    if (!studentId) {
      this.router.navigate(['/login']);
      return;
    }

    console.log("Applying with:", {
      studentId,
      jobId: this.job._id
    });

    this.http.post('http://localhost:5000/api/jobs/apply', {
      studentId,
      jobId: this.job._id
    }).subscribe({
      next: () => {
        console.log("✅ Applied successfully");
        this.showSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => this.showSuccess = false, 3000);
      },
      error: (err) => {
        console.error("❌ Apply error:", err);
        alert(err.error?.message || 'Application failed');
      }
    });
  }
}
