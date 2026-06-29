import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-odonto-agenda',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  cambiarPestana(pestana: string) {
    this.pestanaActiva.set(pestana);
  }

  // Genera un arreglo con los días de Lunes a Domingo de la semana en curso
  generarDiasSemanaActual() {
    const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const hoy = new Date();
    const diaSemanaActual = hoy.getDay(); // 0 es Domingo, 1 es Lunes...
    
    // Ajuste para que el Lunes sea el primer día (1) y Domingo el último (7)
    const distanciaAlLunes = diaSemanaActual === 0 ? -6 : 1 - diaSemanaActual;
    const lunesSemana = new Date(hoy);
    lunesSemana.setDate(hoy.getDate() + distanciaAlLunes);

    this.diasDeLaSemana = nombresDias.map((nombre, index) => {
      const fechaDia = new Date(lunesSemana);
      fechaDia.setDate(lunesSemana.getDate() + index);
      return { nombre, fecha: fechaDia };
    });
  }

  // Filtra las citas que caigan en un día específico del calendario
  filtrarCitasPorDia(fecha: Date): any[] {
    if (!this.agenda().citasDeLaSemana) return [];
    
    return this.agenda().citasDeLaSemana.filter((cita: any) => {
      const fechaCita = new Date(cita.fechaHora);
      return fechaCita.getDate() === fecha.getDate() &&
             fechaCita.getMonth() === fecha.getMonth() &&
             fechaCita.getFullYear() === fecha.getFullYear();
    });
  }

  // Helper estético para resaltar el día actual en la agenda semanal
  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }
}