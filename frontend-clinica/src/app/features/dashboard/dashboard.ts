import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// 👇 Importa el servicio de autenticación
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  metricas: any = {};
  username: string | null = localStorage.getItem('username');

  // 👇 Inyecta el AuthService en el constructor
  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    // Si hay token, cargamos los datos
    if (this.authService.getToken()) {
      this.cargarMetricas();
    }
  }

  cargarMetricas() {
    this.http.get('http://localhost:8080/api/dashboard').subscribe({
      next: (data) => this.metricas = data,
      error: (err) => console.error('Error cargando dashboard', err)
    });
  }

  // 👇 MÉTODO TEMPORAL PARA SIMULAR EL LOGIN
  loginDePrueba() {
    const credencialesAdmin = { username: 'admin', password: 'admin1234' }; // Credenciales de tu DataSeeder
    
    this.authService.login(credencialesAdmin).subscribe({
      next: (res) => {
        alert('✅ Login simulado con éxito. Ya tenemos Token JWT.');
        window.location.reload(); // Recargamos para que todo funcione
      },
      error: (err) => alert('❌ Error: ¿Está encendido Spring Boot en el puerto 8080?')
    });
  }
}