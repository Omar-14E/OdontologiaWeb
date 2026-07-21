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
  
  // Señal original de métricas
  metricas = signal<any>({
    totalPacientes: 0,
    totalOdontologos: 0,
    totalCitas: 0,
    citasDelDia: 0
  });

  // Señales nuevas esperando arreglos desde la BD
  proximasCitas = signal<any[]>([]);
  resumenTratamientos = signal<any[]>([]);

  username: string | null = localStorage.getItem('username');

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.cargarMetricas();
      this.cargarCitas();
      this.cargarGrafico('mes'); // Carga inicial por defecto
    }
  }

  cargarMetricas() {
    this.http.get('http://localhost:8080/api/dashboard').subscribe({
      next: (data) => this.metricas.set(data),
      error: (err) => console.error('Error cargando métricas', err)
    });
  }

  // Nuevo método para citas
  cargarCitas() {
    this.http.get<any[]>('http://localhost:8080/api/dashboard/citas-hoy').subscribe({
      next: (data) => this.proximasCitas.set(data),
      error: (err) => console.error('Error cargando citas', err)
    });
  }

  // Nuevo método para el gráfico
  cargarGrafico(filtro: string) {
    this.http.get<any[]>(`http://localhost:8080/api/dashboard/tratamientos?filtro=${filtro}`).subscribe({
      next: (data) => this.resumenTratamientos.set(data),
      error: (err) => console.error('Error cargando gráfico', err)
    });
  }

  // Método requerido por el <select> del HTML
  filtrarTratamientos(event: any) {
    this.cargarGrafico(event.target.value);
  }

  // Método requerido por los badges del HTML
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

  loginDePrueba() {
    const credencialesAdmin = { username: 'admin', password: 'admin1234' };
    
    this.authService.login(credencialesAdmin).subscribe({
      next: (res: any) => {
        alert('✅ Login simulado con éxito. Ya tenemos Token JWT.');
        window.location.reload();
      },
      error: (err: any ) => alert('❌ Error: ¿Está encendido Spring Boot en el puerto 8080?')
    });
  }
}