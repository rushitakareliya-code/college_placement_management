import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '../../../services/student';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class Students implements OnInit {

  students: any[] = [];


  student: any = this.createEmptyStudent();

  editIndex: number | null = null;

  isModalOpen = false;

  passwordMismatch = false;
  emailTaken = false;
  formError = '';


  private createEmptyStudent() {
    return {
      _id: '',
      name: '',
      email: '',
      number: '',
      address: '',
      password: '',
      confirmPassword: '',
    };
  }

  constructor(
    private studentService: StudentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (data: any[]) => {
        this.students = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load students', err);
        this.toastr.error('Failed to load students');
      },
    });
  }


  openModal() {

    this.student = this.createEmptyStudent();

    this.editIndex = null;

    this.isModalOpen = true;

    this.passwordMismatch = false;
    this.emailTaken = false;
    this.formError = '';

  }


  closeModal() {

    this.isModalOpen = false;

  }


  saveStudent(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    this.passwordMismatch = false;
    this.emailTaken = false;
    this.formError = '';

    const isAddMode = this.editIndex === null;

    if (this.student.password !== this.student.confirmPassword) {
      // Validate password mismatch in add mode; in edit mode validate only if user entered a password
      const hasPassword = !!String(this.student.password || '').trim();
      if (isAddMode || hasPassword) {
        this.passwordMismatch = true;
        return;
      }
    }

    const payload: any = {
      name: String(this.student.name || '').trim(),
      email: String(this.student.email || '').trim(),
      number: Number(this.student.number),
      address: String(this.student.address || '').trim(),
    };

    if (isAddMode) {
      payload.password = this.student.password;
      payload.cpassword = this.student.confirmPassword;
    } else if (String(this.student.password || '').trim()) {
      payload.password = this.student.password;
      payload.cpassword = this.student.confirmPassword;
    }

    if (!isAddMode) {
      const id = this.students[this.editIndex!]?._id;
      this.studentService.updateStudent(id, payload).subscribe({
        next: (updated: any) => {
          this.toastr.success('Student updated successfully');
          this.students[this.editIndex!] = updated;
          this.closeModal();
        },
        error: (err) => {
          console.error('Update failed', err);
          if (err.status === 400 && err.error?.message?.toLowerCase().includes('email')) {
            this.emailTaken = true;
          } else {
            this.formError = err.error?.message || 'Failed to update student';
          }
        },
      });
      return;
    }

    this.studentService.addStudent(payload).subscribe({
      next: (created: any) => {
        this.toastr.success('Student added successfully');
        this.students = [created, ...this.students];
        this.closeModal();
      },
      error: (err) => {
        console.error('Add failed', err);
        if (err.status === 400 && err.error?.message?.toLowerCase().includes('email')) {
          this.emailTaken = true;
        } else {
          this.formError = err.error?.message || 'Failed to add student';
        }
      },
    });
  }


  editStudent(index: number) {
    const selected = this.students[index];
    this.student = {
      _id: selected?._id || '',
      name: selected?.name || '',
      email: selected?.email || '',
      number: selected?.number ?? '',
      address: selected?.address || '',
      password: '',
      confirmPassword: '',
    };
    this.editIndex = index;
    this.isModalOpen = true;
    this.passwordMismatch = false;
    this.emailTaken = false;
    this.formError = '';
  }


  deleteStudent(index: number) {
    const id = this.students[index]?._id;
    if (!id) return;

    const confirmDelete = confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.toastr.success('Student deleted successfully');
        this.students.splice(index, 1);
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.toastr.error('Failed to delete student');
      },
    });
  }

}