import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../auth/services/auth.service';
import Swal from 'sweetalert2'; // 👈 IMPORTACIÓN DE SWEETALERT2 AGREGADA

@Component({
  selector: 'app-odonto-agenda',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './odonto-agenda.html',
  styleUrls: ['./odonto-agenda.css']
})
export class OdontoAgendaComponent implements OnInit {

  agenda = signal<any>({
    citasDeHoy: [],
    pacientesDeHoy: [],
    citasDeLaSemana: []
  });

  pestanaActiva = signal<string>('hoy');
  citaSeleccionada = signal<any | null>(null); 
  diasDeLaSemana: { nombre: string, fecha: Date }[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.generarDiasSemanaActual();
    const token = this.authService.getToken() || localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      this.cargarAgendaMedica();
    } else {
      console.warn('No se encontraron credenciales para cargar la agenda médica.');
    }
  }

  cargarAgendaMedica() {
    this.http.get<any>('http://localhost:8080/api/mi-perfil/citas').subscribe({
      next: (data) => {
        console.log('Datos de la agenda recibidos con éxito:', data);
        this.agenda.set(data);
      },
      error: (err) => {
        console.error('Error cargando la agenda del odontólogo:', err);
      }
    });
  }

  seleccionarCita(cita: any) {
    this.citaSeleccionada.set({ ...cita });
  }

  volverALaAgenda() {
    this.citaSeleccionada.set(null);
    this.cargarAgendaMedica(); 
  }

  // 🌟 MÉTODO OPTIMIZADO CON SWEETALERT2 ESTÉTICO 🌟
  guardarObservacion() {
    const cita = this.citaSeleccionada();
    if (!cita) return;

    this.http.put<any>(`http://localhost:8080/api/citas/actualizar/${cita.id}`, cita).subscribe({
      next: (res) => {
        // Modal de éxito personalizado con la misma estética del consultorio médico
        Swal.fire({
          title: '¡Guardado Exitoso!',
          text: `La cita ha sido actualizada al estado [${cita.estado}] y se registraron las observaciones clínicas correctamente.`,
          icon: 'success',
          confirmButtonColor: '#0d9488',
          customClass: {
            popup: 'swal-custom-font'
          }
        }).then(() => {
          this.volverALaAgenda();
        });
      },
      error: (err) => {
        console.error('Error al guardar la observación:', err);
        
        // Captura el mensaje dinámico enviado por el Backend o usa uno por defecto
        const mensajeError = err.error || 'Hubo un error al guardar los datos en el servidor.';

        // Modal de error personalizado
        Swal.fire({
          title: 'No se pudo guardar',
          text: mensajeError,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'swal-custom-font'
          }
        });
      }
    });
  }

  cambiarPestana(pestana: string) {
    this.pestanaActiva.set(pestana);
  }

  generarDiasSemanaActual() {
    const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const hoy = new Date();
    const diaSemanaActual = hoy.getDay(); 
    
    const distanciaAlLunes = diaSemanaActual === 0 ? -6 : 1 - diaSemanaActual;
    const lunesSemana = new Date(hoy);
    lunesSemana.setDate(hoy.getDate() + distanciaAlLunes);

    this.diasDeLaSemana = nombresDias.map((nombre, index) => {
      const fechaDia = new Date(lunesSemana);
      fechaDia.setDate(lunesSemana.getDate() + index);
      return { nombre, fecha: fechaDia };
    });
  }

  filtrarCitasPorDia(fecha: Date): any[] {
    if (!this.agenda().citasDeLaSemana) return [];
    
    return this.agenda().citasDeLaSemana.filter((cita: any) => {
      const fechaCita = new Date(cita.fechaHora);
      return fechaCita.getDate() === fecha.getDate() &&
             fechaCita.getMonth() === fecha.getMonth() &&
             fechaCita.getFullYear() === fecha.getFullYear();
    });
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }
}