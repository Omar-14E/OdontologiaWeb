import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service'; 

@Component({
  selector: 'app-odonto-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './odonto-pacientes.html',
  styleUrls: ['./odonto-pacientes.scss']
})
export class OdontoPacientesComponent implements OnInit {

  pacientes = signal<any[]>([]);

  pacienteSeleccionado = signal<any | null>(null);

  historialConsultas = signal<any[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken() || localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      this.cargarMisPacientes();
    } else {
      console.warn('No se encontraron credenciales válidas para cargar el registro de pacientes.');
    }
  }

  private getAuthHeaders() {
    const token = this.authService.getToken() || localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  cargarMisPacientes() {
    this.http.get<any[]>('http://localhost:8080/api/mi-perfil/pacientes', this.getAuthHeaders()).subscribe({
      next: (data) => {
        console.log('Pacientes atendidos cargados con éxito:', data);
        this.pacientes.set(data);
      },
      error: (err) => {
        console.error('Error cargando los pacientes:', err);
      }
    });
  }

  verHistorialPaciente(paciente: any) {
    this.pacienteSeleccionado.set(paciente);
    
    this.http.get<any[]>(`http://localhost:8080/api/mi-perfil/historial-paciente/${paciente.id}`, this.getAuthHeaders()).subscribe({
      next: (data) => {
        console.log('Historial clínico recibido:', data);
        this.historialConsultas.set(data);
      },
      error: (err) => {
        console.error('Error cargando el historial clínico:', err);
      }
    });
  }

  volverALaLista() {
    this.pacienteSeleccionado.set(null);
    this.historialConsultas.set([]);
  }
}