import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../../services/contact.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  formData = {
    name: '',
    email: '',
    message: ''
  };
  
  isSubmitting = false;

  constructor(
    private contactService: ContactService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.toastr.error('Please fill out all fields.', 'Validation Error');
      return;
    }

    this.isSubmitting = true;

    this.contactService.submitContact(this.formData).subscribe({
      next: (response) => {
        this.toastr.success('Your message has been sent successfully!', 'Success');
        this.isSubmitting = false;
        this.formData = { name: '', email: '', message: '' };
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('There was an error sending your message. Please try again later.', 'Error');
        this.isSubmitting = false;
        this.cdr.detectChanges();
        console.error('Contact submit error:', error);
      }
    });
  }
}
