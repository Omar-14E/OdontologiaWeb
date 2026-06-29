import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANTE: Agrega FormsModule para el [(ngModel)]
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-odonto-agenda',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // <--- Agregado FormsModule aquí
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
  
  // NUEVO: Almacena la cita que el doctor está atendiendo o editando actualmente
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

  // NUEVO: Selecciona una cita y clona el objeto para manejar la edición localmente
  seleccionarCita(cita: any) {
    this.citaSeleccionada.set({ ...cita });
  }

  // NUEVO: Limpia la selección para regresar al panel de control de citas
  volverALaAgenda() {
    this.citaSeleccionada.set(null);
    this.cargarAgendaMedica(); // Recarga los datos para reflejar los cambios guardados
  }

  // NUEVO: Envía la cita modificada con la observación al backend
  guardarObservacion() {
    const cita = this.citaSeleccionada();
    if (!cita) return;

    // Ahora el estado de la cita se maneja dinámicamente mediante el [(ngModel)] del select
    this.http.put<any>(`http://localhost:8080/api/citas/actualizar/${cita.id}`, cita).subscribe({
      next: (res) => {
        alert(`Cita actualizada a estado [${cita.estado}] con éxito.`);
        this.volverALaAgenda();
      },
      error: (err) => {
        console.error('Error al guardar la observación:', err);
        alert('Hubo un error al guardar los datos en el servidor.');
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