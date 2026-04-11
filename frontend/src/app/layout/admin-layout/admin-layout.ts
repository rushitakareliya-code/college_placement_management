import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit, OnDestroy {
  sidebarOpen = true;

  breadcrumbs: BreadcrumbItem[] = [];
  adminName = 'Administrator';
  adminEmail = '';

  private routerSub?: Subscription;

  private readonly segmentLabels: Record<string, string> = {
    admin: 'Admin',
    dashboard: 'Dashboard',
    students: 'Students',
    companies: 'Companies',
    jobs: 'Jobs',
    applications: 'Applications',
    notices: 'Notices',
    'email-settings': 'Email Settings',
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserFromStorage();
    this.buildBreadcrumbs();
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUserFromStorage();
        this.buildBreadcrumbs();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  loadUserFromStorage(): void {
    let raw = localStorage.getItem('adminUser');
    if (!raw) {
      // Legacy: admin was stored under `user` before adminUser existed
      const legacy = localStorage.getItem('user');
      if (legacy) {
        try {
          const u = JSON.parse(legacy) as { role?: string };
          if (u.role === 'admin') {
            raw = legacy;
          }
        } catch {
          /* ignore */
        }
      }
    }
    if (!raw) {
      this.adminName = 'Administrator';
      this.adminEmail = '';
      return;
    }
    try {
      const u = JSON.parse(raw) as { name?: string; email?: string; role?: string };
      this.adminName = (u.name && String(u.name).trim()) || 'Administrator';
      this.adminEmail = (u.email && String(u.email).trim()) || '';
    } catch {
      this.adminName = 'Administrator';
      this.adminEmail = '';
    }
  }

  get adminInitials(): string {
    const name = this.adminName?.trim();
    if (name && name !== 'Administrator') {
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      if (parts.length === 1 && parts[0].length >= 2) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      if (parts.length === 1) {
        return parts[0].slice(0, 1).toUpperCase() + (parts[0][1] || '').toUpperCase();
      }
    }
    const email = this.adminEmail;
    if (email && email.includes('@')) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  }

  private buildBreadcrumbs(): void {
    const path = this.router.url.split('?')[0];
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0 || segments[0] !== 'admin') {
      this.breadcrumbs = [{ label: 'Admin' }];
      return;
    }

    const items: BreadcrumbItem[] = [];
    let acc = '';

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      acc += `/${seg}`;
      const label =
        this.segmentLabels[seg] ||
        seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const isLast = i === segments.length - 1;
      let url: string | undefined;
      if (!isLast) {
        if (seg === 'admin') {
          url = '/admin/dashboard';
        } else {
          url = acc;
        }
      }
      items.push({ label, url });
    }

    this.breadcrumbs = items;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    this.router.navigate(['/admin/login']);
  }
}
