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
    // Store current time so every notice visible right now is marked as seen.
    // The navbar uses createdAt > seenAt, so any notice created strictly
    // after this moment will still show as unread.
    localStorage.setItem('student_notices_last_seen_at', String(Date.now()));
  }
}
