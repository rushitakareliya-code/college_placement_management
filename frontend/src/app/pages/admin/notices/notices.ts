import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notices.html',
  styleUrl: './notices.css'
})
export class Notices {

  isModalOpen = false;

  notices: any[] = [
    {
      title: "Placement Drive",
      description: "TCS campus drive tomorrow",
      date: "15 March"
    }
  ];

  notice: any = {
    title: '',
    description: '',
    date: ''
  };

  editIndex: number | null = null;

  openModal() {
    this.notice = { title: '', description: '', date: '' };
    this.editIndex = null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveNotice() {

    if (this.editIndex !== null) {
      this.notices[this.editIndex] = { ...this.notice };
    }
    else {
      this.notice.date = new Date().toLocaleDateString();
      this.notices.push({ ...this.notice });
    }

    this.closeModal();
  }

  editNotice(index: number) {
    this.notice = { ...this.notices[index] };
    this.editIndex = index;
    this.isModalOpen = true;
  }

  deleteNotice(index: number) {
    if (confirm("Are you sure you want to delete this notice?")) {
      this.notices.splice(index, 1);
    }
  }

}