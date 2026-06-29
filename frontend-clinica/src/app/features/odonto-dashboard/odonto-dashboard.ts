import { Component, OnInit, signal } from '@angular/core'; // 👈 Importa 'signal'
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-app-odonto-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './odonto-dashboard.html',
  styleUrls: ['./odonto-dashboard.css']
})
export class OdontoDashboardComponent implements OnInit {
  
  // 👈 Convertimos métricas en una Signal reactiva
  metricas = signal<any>({
    nombre: '',
    apellido: '',
    pacientesACargo: 0,
    citasDelDia: 0
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.cargarMetricasOdontologo();
    }
  }

  cargarMetricasOdontologo() {
    this.http.get(`http://localhost:8080/api/mi-perfil/odonto-dashboard`).subscribe({
      next: (data: any) => {
        // 👈 Para actualizar una signal usamos .set()
        this.metricas.set(data); 
      },
      error: (err) => console.error(err)
    });
  }
}