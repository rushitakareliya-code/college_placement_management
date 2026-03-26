import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { Footer } from './footer/footer';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, Footer],
  template: `
    @if (showNavbarFooter) {
    <app-navbar></app-navbar>
    }

    <router-outlet></router-outlet>

    @if (showNavbarFooter) {
    <app-footer></app-footer>
    }
  `,
})
export class App {
  showNavbarFooter = true;

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.showNavbarFooter = !(['/login', '/signup', '/admin/login'].includes(url) || url.startsWith('/admin'));
    });
  }
}