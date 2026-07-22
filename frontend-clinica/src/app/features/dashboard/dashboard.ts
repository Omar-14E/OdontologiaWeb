import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  
  metricas = signal<any>({
    totalPacientes: 0,
    totalOdontologos: 0,
    totalCitas: 0,
    citasDelDia: 0
  });

  proximasCitas = signal<any[]>([]);
  resumenTratamientos = signal<any[]>([]);

  username: string | null = localStorage.getItem('username');
  fechaActual: string = '';

  // Paleta de colores para las barras del gráfico
  private barColors = [
    '#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'
  ];

  private barGradients = [
    'linear-gradient(180deg, #14b8a6 0%, #0d9488 100%)',
    'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
    'linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%)',
    'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
    'linear-gradient(180deg, #f87171 0%, #ef4444 100%)',
    'linear-gradient(180deg, #22d3ee 0%, #06b6d4 100%)',
    'linear-gradient(180deg, #f472b6 0%, #ec4899 100%)'
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.fechaActual = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (this.authService.getToken()) {
      this.cargarMetricas();
      this.cargarCitas();
      this.cargarGrafico('mes'); 
    }
  }

  cargarMetricas() {
    this.http.get('http://localhost:8080/api/dashboard').subscribe({
      next: (data) => this.metricas.set(data),
      error: (err) => console.error('Error cargando métricas', err)
    });
  }

  cargarCitas() {
    this.http.get<any[]>('http://localhost:8080/api/dashboard/citas-hoy').subscribe({
      next: (data) => this.proximasCitas.set(data),
      error: (err) => console.error('Error cargando citas', err)
    });
  }

  cargarGrafico(filtro: string) {
    this.http.get<any[]>(`http://localhost:8080/api/dashboard/tratamientos?filtro=${filtro}`).subscribe({
      next: (data) => this.resumenTratamientos.set(data),
      error: (err) => console.error('Error cargando gráfico', err)
    });
  }

  filtrarTratamientos(event: any) {
    this.cargarGrafico(event.target.value);
  }

  getBarColor(index: number): string {
    return this.barColors[index % this.barColors.length];
  }

  getBarGradient(index: number): string {
    return this.barGradients[index % this.barGradients.length];
  }

  obtenerClaseEstado(estado: string): string {
    if (!estado) return 'bg-secondary';
    switch (estado.toLowerCase()) {
      case 'confirmado':
      case 'atendido':
        return 'bg-success';
      case 'en espera':
      case 'pendiente':
        return 'bg-warning';
      case 'programado':
      case 'agendado':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }
}