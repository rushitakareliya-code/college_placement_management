import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';
import { forkJoin } from 'rxjs';

import { StudentService } from '../../../services/student';
import { CompanyService } from '../../../services/company';
import { JobService } from '../../../services/job';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, AfterViewInit {
  
  totalStudents = 0;
  totalCompanies = 0;
  totalJobs = 0;
  totalApplications = 0;
  
  placementPercentage = 0;
  placedCount = 0;
  
  recentApplications: any[] = [];
  topCompanies: any[] = [];
  
  isLoading = true;
  
  private appsChartInstance: any;
  private placementChartInstance: any;
  
  constructor(
    private studentService: StudentService,
    private companyService: CompanyService,
    private jobService: JobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    this.initCharts([], [], 0, 0, 0);
  }

  loadDashboardData() {
    forkJoin({
      students: this.studentService.getStudents(),
      companies: this.companyService.getCompanies(),
      jobs: this.jobService.getJobs()
    }).subscribe({
      next: ({ students, companies, jobs }) => {
        
        // 1. Basic Counts
        this.totalStudents = students.length;
        this.totalCompanies = companies.length;
        this.totalJobs = jobs.filter((j: any) => j.isActive !== false).length;
        
        // 2. Placements
        this.placedCount = students.filter((s: any) => s.placed).length;
        this.placementPercentage = this.totalStudents > 0 
          ? Math.round((this.placedCount / this.totalStudents) * 100) 
          : 0;
          
        // 3. Applications & Aggregations
        let allApps: any[] = [];
        let companyHires: { [key: string]: number } = {};
        let companyApps: { [key: string]: number } = {};
        
        jobs.forEach((job: any) => {
          const compName = job.companyId?.companyName || job.company || 'Unknown';
          const apps = job.applicants || [];
          
          this.totalApplications += apps.length;
          
          // Count apps per company for chart
          if (!companyApps[compName]) companyApps[compName] = 0;
          companyApps[compName] += apps.length;
          
          apps.forEach((a: any) => {
            // Track all apps for recent list
            allApps.push({
              studentName: a.student?.name || 'Unknown Student',
              role: job.role,
              status: a.status,
              date: a.appliedAt || job.createdAt
            });
            
            // Track hires for top companies
            if (a.status === 'Selected' || a.status === 'Approved') {
              if (!companyHires[compName]) companyHires[compName] = 0;
              companyHires[compName]++;
            }
          });
        });
        
        // Process Recent Apps (sort by newest if date exists, else just take last)
        this.recentApplications = allApps.reverse().slice(0, 4);
        
        // Process Top Companies
        this.topCompanies = Object.keys(companyHires)
          .map(name => ({ name, hires: companyHires[name] }))
          .sort((a, b) => b.hires - a.hires)
          .slice(0, 4);
          
        // Bar Chart Data (Top 4 mostly applied companies)
        const topApplied = Object.keys(companyApps)
          .map(name => ({ name, apps: companyApps[name] }))
          .sort((a, b) => b.apps - a.apps)
          .slice(0, 4);
          
        const barLabels = topApplied.map(c => c.name);
        const barData = topApplied.map(c => c.apps);
        
        // Doughnut Chart Data
        const approvedApps = allApps.filter(a => a.status === 'Selected' || a.status === 'Approved').length;
        const pendingApps = allApps.filter(a => a.status === 'Pending').length;
        const rejectedApps = allApps.filter(a => a.status === 'Rejected').length;
        
        this.isLoading = false;
        this.updateCharts(barLabels, barData, approvedApps, pendingApps, rejectedApps);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.isLoading = false;
      }
    });
  }

  initCharts(barLabels: string[], barData: number[], apprv: number, pend: number, rej: number) {
    const appsCanvas = document.getElementById("applicationsChart") as HTMLCanvasElement;
    const placeCanvas = document.getElementById("placementChart") as HTMLCanvasElement;
    
    if (appsCanvas) {
      this.appsChartInstance = new Chart(appsCanvas, {
        type: 'bar',
        data: {
          labels: barLabels.length ? barLabels : ['No Data'],
          datasets: [{
            label: 'Applications',
            data: barData.length ? barData : [0],
            backgroundColor: '#4f46e5',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    if (placeCanvas) {
      this.placementChartInstance = new Chart(placeCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [{
            data: [apprv, pend, rej],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          cutout: '75%'
        }
      });
    }
  }
  
  updateCharts(barLabels: string[], barData: number[], apprv: number, pend: number, rej: number) {
    if (this.appsChartInstance) {
      this.appsChartInstance.data.labels = barLabels.length ? barLabels : ['No Data'];
      this.appsChartInstance.data.datasets[0].data = barData.length ? barData : [0];
      this.appsChartInstance.update();
    }
    
    if (this.placementChartInstance) {
      const hasApps = apprv > 0 || pend > 0 || rej > 0;
      this.placementChartInstance.data.datasets[0].data = hasApps ? [apprv, pend, rej] : [0, 1, 0];
      this.placementChartInstance.data.datasets[0].backgroundColor = hasApps 
        ? ['#10b981', '#f59e0b', '#ef4444'] 
        : ['#e2e8f0', '#e2e8f0', '#e2e8f0'];
      if (!hasApps) this.placementChartInstance.data.labels = ['No Data Yet', 'No Data Yet', 'No Data Yet'];
      this.placementChartInstance.update();
    }
  }

}