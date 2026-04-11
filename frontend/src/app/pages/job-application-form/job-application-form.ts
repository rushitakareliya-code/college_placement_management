import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface JobApplicationData {
  fullName: string;
  email: string;
  phone: string;
  resume: File | null;
  skills: string;
  experience: string;
  qualification: string;
  currentLocation: string;
  expectedSalary: string;
  projects: string;
  jobId: string;
  studentId: string;
}

@Component({
  selector: 'app-job-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './job-application-form.html',
  styleUrls: ['./job-application-form.css']
})
export class JobApplicationFormComponent implements OnChanges, OnDestroy {

  @ViewChild('resumeInput') resumeInput?: ElementRef<HTMLInputElement>;

  @Input() job: any = null;
  @Input() visible = false;

  @Output() close = new EventEmitter<void>();
  @Output() applicationSubmitted = new EventEmitter<void>();

  formData: JobApplicationData = {
    fullName: '',
    email: '',
    phone: '',
    resume: null,
    skills: '',
    experience: '',
    qualification: '',
    currentLocation: '',
    expectedSalary: '',
    projects: '',
    jobId: '',
    studentId: ''
  };

  resumeName = '';
  resumeSubmitError = false;
  isSubmitting = false;

  /** Inline error banner – replaces alert() */
  errorMessage = '';
  private errorTimer: any;

  constructor(private http: HttpClient) {}

  ngOnChanges() {
    console.log('Form opened with job:', this.job);

    if (this.visible && this.job) {
      this.formData.jobId = this.job._id;

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.formData.studentId = user.id || user._id || '';
      console.log('Student ID from localStorage:', this.formData.studentId);

      this.formData.fullName = user.name || '';
      this.formData.email = user.email || '';
    }
  }

  onResumeSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (
        file.type === 'application/pdf' ||
        file.type.includes('word') ||
        file.name.match(/\.(pdf|doc|docx)$/i)
      ) {
        this.formData.resume = file;
        this.resumeName = file.name;
        this.resumeSubmitError = false;
      } else {
        console.error('Invalid file type');
        input.value = '';
        this.formData.resume = null;
        this.resumeName = '';
      }
    }
  }

  submitApplication(appForm: NgForm) {
    if (this.isSubmitting) return;

    appForm.control.markAllAsTouched();
    this.resumeSubmitError = !this.formData.resume;
    if (appForm.invalid || this.resumeSubmitError) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = ''; // Clear previous errors

    const formDataToSend = new FormData();

    Object.keys(this.formData).forEach(key => {
      if (key === 'resume') {
        if (this.formData.resume) {
          formDataToSend.append('resume', this.formData.resume);
        }
      } else {
        formDataToSend.append(key, (this.formData as any)[key]);
      }
    });

    console.log('Submitting application:', this.formData);

    this.http.post('http://localhost:5000/api/jobs/apply', formDataToSend)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          console.log('✅ Application submitted');
          this.applicationSubmitted.emit();
          this.resetForm();
        },
        error: (err: any) => {
          this.isSubmitting = false;
          console.error('❌ Application failed:', err);
          let msg = 'Application failed. Please try again.';
          if (err?.error?.message && typeof err.error.message === 'string') {
            msg = err.error.message;
          } else if (err?.status === 400 && err?.error?.message?.toLowerCase().includes('already applied')) {
            msg = 'You have already applied for this job.';
          } else if (err?.status === 500) {
            msg = 'Server error. Please try again later.';
          }
          this.showError(msg);
          
          // Scroll to the top of the modal to show the error
          const modal = document.querySelector('.max-h-\\[90vh\\]');
          if (modal) {
            modal.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });
  }

  resetForm() {
    this.formData = {
      fullName: '',
      email: '',
      phone: '',
      resume: null,
      skills: '',
      experience: '',
      qualification: '',
      currentLocation: '',
      expectedSalary: '',
      projects: '',
      jobId: '',
      studentId: ''
    };
    this.resumeName = '';
    this.resumeSubmitError = false;
    if (this.resumeInput?.nativeElement) {
      this.resumeInput.nativeElement.value = '';
    }
  }

  closeForm() {
    this.resumeSubmitError = false;
    this.clearError();
    this.close.emit();
  }

  /** Show inline error banner and auto-dismiss after 5 s */
  showError(msg: string) {
    this.errorMessage = msg;
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  clearError() {
    this.errorMessage = '';
    clearTimeout(this.errorTimer);
  }

  ngOnDestroy() {
    clearTimeout(this.errorTimer);
  }
}