import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard';
import { DashboardDTO } from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  datos: DashboardDTO | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getTotales().subscribe({
      next: (data) => {
        this.datos = data;
      },
      error: (err) => {
        console.error('Error al conectar con el endpoint del dashboard', err);
      }
    });
  }
}
