import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html'
})
export class Dashboard implements AfterViewInit {

  ngAfterViewInit() {

    new Chart("applicationsChart", {
      type: 'bar',
      data: {
        labels: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
        datasets: [{
          label: 'Applications',
          data: [90, 70, 60, 40]
        }]
      }
    });


    new Chart("placementChart", {
      type: 'doughnut',
      data: {
        labels: ['Placed', 'Pending', 'Rejected'],
        datasets: [{
          data: [60, 40, 20]
        }]
      }
    });

  }

}