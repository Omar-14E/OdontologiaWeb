import { Component, OnInit, signal, computed } from '@angular/core'; // 👈 Añadido computed
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
  
  // Métricas Generales del perfil
  metricas = signal<any>({
    nombre: '',
    apellido: '',
    pacientesACargo: 0,
    citasDelDia: 0,
    pacientesHistoricos: 0
  });

  // Lista detallada de la agenda de hoy para las tarjetas internas con scroll
  agendaHoy = signal<any[]>([]);

  // 🕒 MOCKUP DEL HORARIO: Simulación estética de la jornada del Odontólogo
  horarioMock = signal({
    entrada: '08:00 AM',
    salida: '04:00 PM',
    progresoPorcentaje: 65 // Simula que va al 65% de su jornada
  });

  // ⏳ CONTADOR REGRESIVO REACTIVO: Calcula cuántas citas del día siguen en estado 'PENDIENTE'
  citasFaltantes = computed(() => {
    return this.agendaHoy().filter(cita => cita.estado === 'PENDIENTE').length;
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.cargarMetricasOdontologo();
      this.cargarAgendaDetalle();
    }
  }

  cargarMetricasOdontologo() {
  // 👈 Ahora apunta directamente a la raíz del recurso sin añadir nada más al final
    this.http.get(`http://localhost:8080/api/mi-perfil`).subscribe({
      next: (data: any) => {
        this.metricas.set(data); 
      },
      error: (err) => console.error(err)
    });
  }

  cargarAgendaDetalle() {
    // Reutilizamos tu endpoint existente de citas para rellenar los datos de las tarjetas de contacto
    this.http.get(`http://localhost:8080/api/mi-perfil/citas`).subscribe({
      next: (data: any) => {
        if (data && data.citasDeHoy) {
          this.agendaHoy.set(data.citasDeHoy);
        }
      },
      error: (err) => console.error(err)
    });
  }

  // Helper para generar las iniciales estéticas del círculo (Ej: "Maria Lopez" -> "ML")
  getIniciales(paciente: any): string {
    if (!paciente || !paciente.nombre) return 'PX';
    const n = paciente.nombre.trim().charAt(0).toUpperCase();
    const a = paciente.apellido ? paciente.apellido.trim().charAt(0).toUpperCase() : '';
    return `${n}${a}`;
  }
}