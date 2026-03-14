import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notices.html',
  styleUrls: ['./notices.css']
})
export class Notices {

  isModalOpen = false;

  notices: any[] = [
    {
      title: "Placement Drive",
      message: "TCS campus drive tomorrow",
      sender_role: "tpo_admin",
      receiver_role: "student",
      createdAt: new Date()
    }
  ];


  notice: any = this.createEmptyNotice();

  editIndex: number | null = null;


  createEmptyNotice() {
    return {
      title: '',
      message: '',
      sender_role: '',
      receiver_role: '',
      createdAt: ''
    };
  }


  openModal() {

    this.notice = this.createEmptyNotice();

    this.editIndex = null;

    this.isModalOpen = true;

  }


  closeModal() {

    this.isModalOpen = false;

  }


  saveNotice() {

    const data = JSON.parse(JSON.stringify(this.notice));

    if (this.editIndex !== null) {

      this.notices[this.editIndex] = data;

    } else {

      data.createdAt = new Date();

      this.notices.push(data);

    }

    this.closeModal();

  }


  editNotice(index: number) {

    this.notice = JSON.parse(JSON.stringify(this.notices[index]));

    this.editIndex = index;

    this.isModalOpen = true;

  }


  deleteNotice(index: number) {

    if (confirm("Are you sure you want to delete this notice?")) {

      this.notices.splice(index, 1);

    }

  }

}