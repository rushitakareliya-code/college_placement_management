import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class Students {

  students: any[] = [
    {
      first_name: 'Rahul',
      middle_name: '',
      last_name: 'Patel',
      email: 'rahul@mail.com',
      number: '9876543210',

      studentProfile: {
        department: 'Computer',
        year: 3,
        rollNumber: 101,
        liveKT: 0,
        gap: false,

        pastQualification: {
          ssc: { percentage: 85 },
          hsc: { percentage: 82 }
        },

        resume: ''
      }
    }
  ];


  student: any = this.getEmptyStudent();

  editIndex: number | null = null;

  isModalOpen = false;


  // Create empty student structure
  getEmptyStudent() {

    return {
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      number: '',

      studentProfile: {
        department: '',
        year: null,
        rollNumber: null,
        liveKT: 0,
        gap: false,

        pastQualification: {
          ssc: { percentage: null },
          hsc: { percentage: null }
        },

        resume: ''
      }
    };

  }


  openModal() {

    this.student = this.getEmptyStudent();

    this.editIndex = null;

    this.isModalOpen = true;

  }


  closeModal() {

    this.isModalOpen = false;

  }


  saveStudent() {

    const studentData = JSON.parse(JSON.stringify(this.student));

    if (this.editIndex !== null) {

      this.students[this.editIndex] = studentData;

    } else {

      this.students.push(studentData);

    }

    this.closeModal();

  }


  editStudent(index: number) {

    this.student = JSON.parse(JSON.stringify(this.students[index]));

    this.editIndex = index;

    this.isModalOpen = true;

  }


  deleteStudent(index: number) {

    const confirmDelete = confirm("Are you sure you want to delete this student?");

    if (confirmDelete) {

      this.students.splice(index, 1);

    }

  }

}