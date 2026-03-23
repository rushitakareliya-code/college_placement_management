import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(
    private router: Router, 
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Please login to access this page', 'Login Required');
      return this.router.createUrlTree(['/admin/login']);
    }

    const adminUserRaw = localStorage.getItem('adminUser');
    const legacyRaw = localStorage.getItem('user');

    const parse = (raw: string | null): any | null => {
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const adminUser = parse(adminUserRaw);
    const legacyUser = parse(legacyRaw);

    const isAdmin = (u: any) => !!u && (u.role === 'admin' || (!!u.email && String(u.email).includes('@')));

    if (isAdmin(adminUser) || isAdmin(legacyUser)) {
      return true;
    }

    return this.router.createUrlTree(['/admin/login']);
  }
}

