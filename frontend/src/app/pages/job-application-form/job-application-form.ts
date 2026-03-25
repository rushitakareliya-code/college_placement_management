import { Component, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';
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
export class JobApplicationFormComponent implements OnChanges {

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

  constructor(private http: HttpClient) {}

  ngOnChanges() {
    console.log("Form opened with job:", this.job);

    if (this.visible && this.job) {
      this.formData.jobId = this.job._id;

      // Get student ID from localStorage instead of input
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.formData.studentId = user.id || user._id || '';
      console.log("Student ID from localStorage:", this.formData.studentId);

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
    appForm.control.markAllAsTouched();
    this.resumeSubmitError = !this.formData.resume;
    if (appForm.invalid || this.resumeSubmitError) {
      return;
    }

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

    console.log("Submitting application:", this.formData);

    this.http.post('http://localhost:5000/api/jobs/apply', formDataToSend)
      .subscribe({
        next: () => {
          console.log("✅ Application submitted");
          this.applicationSubmitted.emit();
          this.resetForm();
        },
        error: (err: any) => {
          console.error("❌ Application failed:", err);
          let msg = 'Application failed';
          if (err?.error?.message && typeof err.error.message === 'string') {
            msg = err.error.message;
          } else if (err?.status === 500) {
            msg = 'Server error. Please try again later.';
          }
          alert(msg);
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
    this.close.emit();
  }
}