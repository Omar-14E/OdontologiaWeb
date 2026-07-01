import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service'; // <--- IMPORTACIÓN AGREGADA

@Component({
  selector: 'app-odonto-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './odonto-pacientes.html',
  styleUrls: ['./odonto-pacientes.scss']
})
export class OdontoPacientesComponent implements OnInit {

  // Almacena la lista de todos los pacientes que ya atendió el odontólogo
  pacientes = signal<any[]>([]);

  // Almacena el paciente que se está consultando actualmente para la vista de detalle
  pacienteSeleccionado = signal<any | null>(null);

  // Almacena la lista de consultas (DTO) del paciente seleccionado
  historialConsultas = signal<any[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService // <--- INYECCIÓN DEL SERVICIO AGREGADA
  ) {}

  ngOnInit(): void {
    // Validamos que existan las credenciales antes de hacer la carga inicial
    const token = this.authService.getToken() || localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      this.cargarMisPacientes();
    } else {
      console.warn('No se encontraron credenciales válidas para cargar el registro de pacientes.');
    }
  }

  // Helper optimizado para configurar los Headers con tu servicio de autenticación
  private getAuthHeaders() {
    const token = this.authService.getToken() || localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Carga inicial de pacientes desde el backend
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

  // Se ejecuta al hacer clic en la tarjeta de un paciente
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

  // Limpia el estado para regresar a la cuadrícula general de pacientes
  volverALaLista() {
    this.pacienteSeleccionado.set(null);
    this.historialConsultas.set([]);
  }
}