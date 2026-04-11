import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoticeService } from '../../services/notice';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  studentName = '';
  unreadNoticeCount = 0;
  isMobileMenuOpen = false;
  private pollTimer: any = null;
  private readonly onWindowFocus = () => {
    if (this.isLoggedIn) this.fetchUnreadNoticeCount();
  };
  private readonly noticeSeenKey = 'student_notices_last_seen_at';

  constructor(private router: Router, private noticeService: NoticeService) {}

  ngOnInit() {
    this.checkAuth();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.checkAuth();
    });
    this.startNoticePolling();
    window.addEventListener('focus', this.onWindowFocus);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    window.removeEventListener('focus', this.onWindowFocus);
  }

  checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'student') {
        const wasLoggedIn = this.isLoggedIn;
        this.isLoggedIn = true;
        this.studentName = user.name?.split(' ')[0] || 'Student';
        // Only fetch on first login detection; polling handles subsequent updates.
        if (!wasLoggedIn) {
          this.fetchUnreadNoticeCount();
        }
        return;
      }
    }
    // Not logged in – clear state
    this.isLoggedIn = false;
    this.unreadNoticeCount = 0;
  }

  startNoticePolling(): void {
    this.pollTimer = setInterval(() => {
      if (this.isLoggedIn) {
        this.fetchUnreadNoticeCount();
      }
    }, 5000);
  }

  fetchUnreadNoticeCount(): void {
    this.noticeService.getNotices().subscribe({
      next: (data: any) => {
        const notices = Array.isArray(data) ? data : [];
        const seenAtRaw = localStorage.getItem(this.noticeSeenKey) || '0';
        const seenAt = Number(seenAtRaw) || 0;
        this.unreadNoticeCount = notices.filter((notice: any) => {
          const createdAt = new Date(notice?.createdAt || 0).getTime();
          return createdAt > seenAt;
        }).length;
      },
      error: () => {
        this.unreadNoticeCount = 0;
      }
    });
  }

  openNotices(): void {
    localStorage.setItem(this.noticeSeenKey, String(Date.now()));
    this.unreadNoticeCount = 0;
    this.router.navigate(['/notices']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(this.noticeSeenKey);
    this.isLoggedIn = false;
    this.unreadNoticeCount = 0;
    this.router.navigate(['/login']);
  }
}