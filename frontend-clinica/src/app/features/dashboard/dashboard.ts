import { Component, OnInit, signal } from '@angular/core'; // 👈 Importamos signal
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
  
  // 👈 Convertimos metricas en una Signal con un estado inicial seguro
  metricas = signal<any>({
    totalPacientes: 0,
    totalOdontologos: 0,
    totalCitas: 0,
    citasDelDia: 0
  });

  username: string | null = localStorage.getItem('username');

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.cargarMetricas();
    }
  }

  cargarMetricas() {
    this.http.get('http://localhost:8080/api/dashboard').subscribe({
      // 👈 Actualizamos la signal usando .set()
      next: (data) => this.metricas.set(data),
      error: (err) => console.error('Error cargando dashboard', err)
    });
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