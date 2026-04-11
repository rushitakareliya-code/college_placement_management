import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { JobService } from '../../../services/job';
import { PlacementService } from '../../../services/placement';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface JobSummary {
  _id: string; // job ID for backend fetch
  role: string;
  company: string;
  location: string;
  exp: string;
  type?: string;
  applied?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  loadError = '';

  private allJobs: JobSummary[] = [];
  displayJobs: JobSummary[] = [];

  searchQuery = '';

  // pagination
  readonly pageSize = 6;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private router: Router,
    private jobService: JobService,
    private placementService: PlacementService,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  private mapJob(job: any, appliedIds: Set<string>): JobSummary {
    return {
      _id: job?._id,
      role: job?.role ?? '',
      company: job?.companyId?.companyName ?? job?.company ?? '',
      location: job?.location ?? '',
      exp: job?.experience ?? job?.exp ?? '',
      type: job?.type ?? '',
      applied: appliedIds.has(job?._id)
    };
  }

  private applyFiltersAndPagination(): void {
    const q = this.searchQuery.trim().toLowerCase();

    const filtered = q
      ? this.allJobs.filter((j) => {
          const hay = `${j.role} ${j.company} ${j.location} ${j.exp} ${j.type ?? ''}`.toLowerCase();
          return hay.includes(q);
        })
      : this.allJobs;

    // Search requirement: show all matching jobs (no pagination while searching)
    if (q) {
      this.displayJobs = filtered;
      this.totalPages = 1;
      this.currentPage = 1;
      return;
    }

    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.displayJobs = filtered.slice(start, start + this.pageSize);
  }

  get isSearching(): boolean {
    return !!this.searchQuery.trim();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFiltersAndPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFiltersAndPagination();
    }
  }

  private loadJobs(): void {
    this.isLoading = true;
    this.loadError = '';

    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const studentId = (user?.role === 'student') ? (user?.id || user?._id) : null;

    const jobs$ = this.jobService.getJobs();
    const placements$ = studentId 
      ? this.placementService.getStudentApplications(studentId).pipe(catchError(() => of([])))
      : of([]);

    forkJoin({
      jobs: jobs$,
      placements: placements$
    }).subscribe({
      next: ({ jobs, placements }) => {
        const appliedJobIds = new Set<string>();
        if (Array.isArray(placements)) {
          placements.forEach((p: any) => {
            const jobId = p.job?._id || p.job;
            if (jobId) appliedJobIds.add(jobId.toString());
          });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.allJobs = (jobs || [])
          .filter((j: any) => {
            if (j.isActive === false) return false;
            if (j.deadline) {
              const deadlineDate = new Date(j.deadline);
              deadlineDate.setHours(0, 0, 0, 0);
              if (deadlineDate.getTime() < today.getTime()) {
                return false;
              }
            }
            return true;
          })
          .map((j: any) => this.mapJob(j, appliedJobIds));
          
        this.currentPage = 1;
        this.applyFiltersAndPagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load jobs', err);
        this.loadError = 'Failed to load jobs';
        this.displayJobs = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openJob(id: string) {
    this.router.navigate(['/job', id]);
  }

  scrollToJobs() {
    const section = document.getElementById('jobsSection');
    section?.scrollIntoView({ behavior: 'smooth' });
  }
}