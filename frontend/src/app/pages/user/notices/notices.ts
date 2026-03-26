import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoticeService } from '../../../services/notice';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-notices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notices.html',
  styleUrl: './notices.css'
})
export class UserNotices implements OnInit {
  notices: any[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadNotices();
  }

  constructor(private noticeService: NoticeService, private cdr: ChangeDetectorRef) {}

  loadNotices(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.noticeService.getNotices()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
      next: (data: any) => {
        this.notices = Array.isArray(data) ? data : [];
        this.clearNoticeCount();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load notices';
      }
    });
  }

  clearNoticeCount(): void {
    const latestCreatedAt = this.notices.length
      ? this.notices[0]?.createdAt
      : null;
    const seenAt = latestCreatedAt ? new Date(latestCreatedAt).getTime() : Date.now();
    localStorage.setItem('student_notices_last_seen_at', String(seenAt));
  }
}
