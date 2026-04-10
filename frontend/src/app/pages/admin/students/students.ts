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

  constructor(
    private studentService: StudentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  // Pagination state
  currentPage: number = 1;
  itemsPerPage: number = 10;
  public Math = Math;

  // Search state
  searchQuery: string = '';

  onSearch() {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get filteredStudents() {
    if (!this.searchQuery) return this.students;
    const query = this.searchQuery.toLowerCase();
    return this.students.filter(s => 
      s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.number?.includes(query)
    );
  }

  get paginatedStudents() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredStudents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredStudents.length / this.itemsPerPage);
  }

  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.loadStudents();
  }

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

  // ✅ Load students
  private loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (data: any[]) => {
        this.students = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load students', err);
      },
    });
  }

  // ✅ Open Modal
  openModal() {
    this.student = this.createEmptyStudent();
    this.editIndex = null;
    this.isModalOpen = true;

    this.passwordMismatch = false;
    this.emailTaken = false;
    this.formError = '';
  }

  // ✅ Close Modal
  closeModal() {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  // ✅ Save Student (Add + Edit)
  saveStudent(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched(); // 🔥 shows validation errors
      return;
    }

    this.passwordMismatch = false;
    this.emailTaken = false;
    this.formError = '';

    const isAddMode = this.editIndex === null;

    // ✅ Password Match Check
    if (this.student.password !== this.student.confirmPassword) {
      const hasPassword = !!String(this.student.password || '').trim();
      if (isAddMode || hasPassword) {
        this.passwordMismatch = true;
        return;
      }
    }

    const payload: any = {
      name: this.student.name.trim(),
      email: this.student.email.trim(),
      number: Number(this.student.number),
      address: this.student.address.trim(),
    };

    if (isAddMode) {
      payload.password = this.student.password;
      payload.cpassword = this.student.confirmPassword;
    } else if (this.student.password?.trim()) {
      payload.password = this.student.password;
      payload.cpassword = this.student.confirmPassword;
    }

    // ===========================
    // ✏️ UPDATE STUDENT
    // ===========================
    if (!isAddMode) {
      const id = this.students[this.editIndex!]?._id;

      this.studentService.updateStudent(id, payload).subscribe({
        next: (updated: any) => {
          this.toastr.success('Student updated successfully');

          // ✅ Update UI instantly
          this.students = this.students.map((item, idx) =>
            idx === this.editIndex ? updated : item
          );

          this.closeModal();
          this.cdr.detectChanges(); // 🔥 important fix
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

    // ===========================
    // ➕ ADD STUDENT
    // ===========================
    this.studentService.addStudent(payload).subscribe({
      next: (created: any) => {
        this.toastr.success('Student added successfully');

        // ✅ Update UI instantly
        this.students = [created, ...this.students];

        this.closeModal();
        this.cdr.detectChanges(); // 🔥 important fix
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

  // ✅ Edit Student
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

  // ✅ Delete Student
  deleteStudent(index: number) {
    const id = this.students[index]?._id;
    if (!id) return;

    const confirmDelete = confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.toastr.success('Student deleted successfully');

        // ✅ Remove from UI instantly
        this.students = this.students.filter((_, idx) => idx !== index);

        this.cdr.detectChanges(); // 🔥 important fix
      },
      error: (err) => {
        console.error('Delete failed', err);
      },
    });
  }
}