import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {

  students:any[] = [
    { name: 'Rahul Patel', email: 'rahul@mail.com', course: 'BCA' }
  ];

  student:any = {
    name:'',
    email:'',
    course:''
  };

  editIndex:number | null = null;
  isModalOpen = false;

  openModal(){
    this.student = {name:'',email:'',course:''};
    this.editIndex = null;
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
  }

  saveStudent(){

    if(this.editIndex !== null){
      this.students[this.editIndex] = {...this.student};
    }
    else{
      this.students.push({...this.student});
    }

    this.closeModal();
  }

  editStudent(index:number){
    this.student = {...this.students[index]};
    this.editIndex = index;
    this.isModalOpen = true;
  }

  deleteStudent(index:number){
    if(confirm("Are you sure you want to delete this student?")){
      this.students.splice(index,1);
    }
  }

}