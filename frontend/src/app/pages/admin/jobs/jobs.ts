import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CompanyService } from '../../../services/company';
import { JobService } from '../../../services/job';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class Jobs implements OnInit {
  jobs: any[] = [];
  companies: any[] = [];

  job: any = this.createEmptyJob();

  editIndex: number | null = null;
  isModalOpen = false;
  isDetailsModalOpen = false;
  detailJob: any = null;
  formError = '';

  constructor(
    private jobService: JobService,
    private companyService: CompanyService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadJobs();
  }

  createEmptyJob() {
    return {
      _id: '',
      role: '',
      companyId: '',
      location: '',
      type: '',
      experience: '',
      salary: '',
      workingDays: '',
      weekOff: '',
      shift: '',
      description: '',
      responsibilitiesText: '',
      requirementsText: '',
      companyName: '',
      applicants: [] as any[],
      applicantCount: 0,
      createdAt: undefined as string | undefined,
      updatedAt: undefined as string | undefined,
      isActive: undefined as boolean | undefined,
    };
  }

  private linesToArray(text: string): string[] {
    if (!text || !String(text).trim()) return [];
    return String(text)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /** For view-details template */
  splitLines(text: string | undefined): string[] {
    return this.linesToArray(text || '');
  }

  private mapJobToView(job: any): any {
    const pop =
      job.companyId && typeof job.companyId === 'object'
        ? job.companyId
        : null;
    const companyId =
      pop && pop._id ? pop._id : job.companyId ? String(job.companyId) : '';

    return {
      _id: job._id,
      role: job.role || '',
      companyId,
      companyName: pop?.companyName || job.company || '',
      location: job.location || '',
      type: job.type || '',
      experience: job.experience || '',
      salary: job.salary || '',
      workingDays: job.workingDays || '',
      weekOff: job.weekOff || '',
      shift: job.shift || '',
      description: job.description || '',
      responsibilitiesText: Array.isArray(job.responsibilities)
        ? job.responsibilities.join('\n')
        : '',
      requirementsText: Array.isArray(job.requirements)
        ? job.requirements.join('\n')
        : '',
      applicants: job.applicants || [],
      applicantCount: (job.applicants || []).filter(
        (a: any) => a && a.student
      ).length,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      isActive: job.isActive,
    };
  }

  private getPayload() {
    return {
      role: this.job.role,
      companyId: this.job.companyId,
      location: this.job.location,
      type: this.job.type,
      experience: this.job.experience,
      salary: this.job.salary,
      workingDays: this.job.workingDays,
      weekOff: this.job.weekOff,
      shift: this.job.shift,
      description: this.job.description,
      responsibilities: this.linesToArray(this.job.responsibilitiesText),
      requirements: this.linesToArray(this.job.requirementsText),
    };
  }

  loadJobs() {
    this.jobService.getJobs().subscribe({
      next: (data: any[]) => {
        this.jobs = data.map((item: any) => this.mapJobToView(item));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load jobs', err);
        this.toastr.error('Failed to load jobs');
      },
    });
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (data: any[]) => {
        this.companies = data;
      },
      error: (err) => {
        console.error('Failed to load companies', err);
        this.toastr.error('Failed to load companies');
      },
    });
  }

  openModal() {
    this.closeJobDetailsModal();
    this.job = this.createEmptyJob();
    this.editIndex = null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  openJobDetails(index: number) {
    const row = this.jobs[index];
    if (!row) {
      return;
    }
    this.detailJob = JSON.parse(JSON.stringify(row));
    this.isDetailsModalOpen = true;
  }

  closeJobDetailsModal() {
    this.isDetailsModalOpen = false;
    this.detailJob = null;
  }

  saveJob(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    const payload = this.getPayload();
    this.formError = '';

    if (this.editIndex !== null) {
      const id = this.jobs[this.editIndex]?._id;
      if (!id) {
        this.toastr.error('Invalid job selected');
        return;
      }

      this.jobService.updateJob(id, payload).subscribe({
        next: (updatedJob: any) => {
          const updated = updatedJob?.job || updatedJob;
          this.toastr.success('Job updated successfully');
          this.jobs = this.jobs.map((item, idx) => idx === this.editIndex ? this.mapJobToView(updated) : item);
          this.closeModal();
          this.loadJobs();
        },
        error: (err) => {
          console.error('Failed to update job', err);
          this.formError = err?.error?.message || 'Failed to update job';
        },
      });
    } else {
      this.jobService.addJob(payload).subscribe({
        next: (createdJob: any) => {
          const created = createdJob?.job || createdJob;
          this.toastr.success('Job added successfully');
          this.jobs = [this.mapJobToView(created), ...this.jobs];
          this.closeModal();
          this.loadJobs();
        },
        error: (err) => {
          console.error('Failed to add job', err);
          this.formError = err?.error?.message || 'Failed to add job';
        },
      });
    }
  }

  editJob(index: number) {
    this.closeJobDetailsModal();
    this.job = JSON.parse(JSON.stringify(this.jobs[index]));
    this.editIndex = index;
    this.isModalOpen = true;
  }

  deleteJob(index: number) {
    const id = this.jobs[index]?._id;
    if (!id) {
      this.toastr.error('Invalid job selected');
      return;
    }
    const confirmDelete = confirm('Are you sure you want to delete this job?');
    if (!confirmDelete) return;
    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.toastr.success('Job deleted successfully');
        this.jobs = this.jobs.filter((_, idx) => idx !== index);
        this.cdr.detectChanges();
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to delete job', err);
        this.toastr.error('Failed to delete job');
      },
    });
  }
}
