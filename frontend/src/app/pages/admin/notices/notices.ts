import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NoticeService } from '../../../services/notice';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notices.html',
  styleUrls: ['./notices.css']
})
export class Notices implements OnInit {

  isModalOpen = false;

  notices: any[] = [];


  notice: any = this.createEmptyNotice();

  editIndex: number | null = null;

  constructor(
    private noticeService: NoticeService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadNotices();
  }

  createEmptyNotice() {
    return {
      _id: '',
      title: '',
      message: '',
      attachments: [],
      createdAt: ''
    };
  }

  selectedFiles: File[] = [];

  private buildFormData(existingAttachments: string[] = []): FormData {
    const formData = new FormData();
    formData.append('title', this.notice.title);
    formData.append('message', this.notice.message);
    formData.append('existingAttachments', JSON.stringify(existingAttachments));
    this.selectedFiles.forEach((file) => {
      formData.append('attachments', file);
    });
    return formData;
  }

  loadNotices() {
    this.noticeService.getNotices().subscribe({
      next: (data: any[]) => {
        this.notices = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notices', err);
        this.toastr.error('Failed to load notices');
      }
    });
  }


  openModal() {

    this.notice = this.createEmptyNotice();

    this.editIndex = null;
    this.selectedFiles = [];

    this.isModalOpen = true;

  }


  closeModal() {

    this.isModalOpen = false;

  }


  saveNotice() {
    if (!this.notice.title || !this.notice.message) {
      this.toastr.warning('Title and message are required');
      return;
    }

    if (this.editIndex !== null) {
      const id = this.notices[this.editIndex]?._id;
      if (!id) {
        this.toastr.error('Invalid notice selected');
        return;
      }
      const existingAttachments = this.notices[this.editIndex]?.attachments || [];
      const formData = this.buildFormData(existingAttachments);
      this.noticeService.updateNotice(id, formData).subscribe({
        next: (updatedNotice: any) => {
          this.notices[this.editIndex!] = updatedNotice;
          this.toastr.success('Notice updated successfully');
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update notice', err);
          this.toastr.error('Failed to update notice');
        }
      });

    } else {
      const formData = this.buildFormData();
      this.noticeService.addNotice(formData).subscribe({
        next: (createdNotice: any) => {
          this.notices = [createdNotice, ...this.notices];
          this.toastr.success('Notice added successfully');
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to add notice', err);
          this.toastr.error('Failed to add notice');
        }
      });

    }

  }


  editNotice(index: number) {

    this.notice = JSON.parse(JSON.stringify(this.notices[index]));
    this.selectedFiles = [];

    this.editIndex = index;

    this.isModalOpen = true;

  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files ? Array.from(input.files) : [];
  }


  deleteNotice(index: number) {
    const id = this.notices[index]?._id;
    if (!id) {
      this.toastr.error('Invalid notice selected');
      return;
    }

    if (confirm("Are you sure you want to delete this notice?")) {
      this.noticeService.deleteNotice(id).subscribe({
        next: () => {
          this.notices.splice(index, 1);
          this.toastr.success('Notice deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete notice', err);
          this.toastr.error('Failed to delete notice');
        }
      });

    }

  }

}