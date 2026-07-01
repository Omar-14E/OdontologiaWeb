import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-app-odonto-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './odonto-dashboard.html',
  styleUrls: ['./odonto-dashboard.scss']
})
export class OdontoDashboardComponent implements OnInit {
  
  metricas = signal<any>({
    nombre: '',
    apellido: '',
    pacientesACargo: 0,
    citasDelDia: 0,
    pacientesHistoricos: 0
  });

  agendaHoy = signal<any[]>([]);

  // Horario dinámico real
  horarioReal = signal<any>({
    tieneTurno: false,
    entrada: '',
    salida: '',
    progresoPorcentaje: 0
  });

  citasFaltantes = computed(() => {
    return this.agendaHoy().filter(cita => cita.estado === 'PENDIENTE').length;
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.cargarMetricasOdontologo();
      this.cargarAgendaDetalle();
      this.cargarHorarioRealHoy(); // 👈 Invocación limpia
    }
  }

  cargarMetricasOdontologo() {
    this.http.get(`http://localhost:8080/api/mi-perfil`).subscribe({
      next: (data: any) => {
        this.metricas.set(data); 
      },
      error: (err) => console.error(err)
    });
  }

  cargarAgendaDetalle() {
    this.http.get(`http://localhost:8080/api/mi-perfil/citas`).subscribe({
      next: (data: any) => {
        if (data && data.citasDeHoy) {
          this.agendaHoy.set(data.citasDeHoy);
        }
      },
      error: (err) => console.error(err)
    });
  }

  cargarHorarioRealHoy() {
    this.http.get(`http://localhost:8080/api/mi-perfil/horario-hoy`).subscribe({
      next: (horario: any) => {
        this.procesarHorarioYProgreso(horario);
      },
      error: (err) => console.error(err)
    });
  }

  private procesarHorarioYProgreso(horario: any) {
    if (!horario || !horario.tieneTurno) {
      this.horarioReal.set({ tieneTurno: false, entrada: '', salida: '', progresoPorcentaje: 0 });
      return;
    }

    const ahora = new Date();
    const [horaIn, minIn] = horario.entrada.split(':').map(Number);
    const [horaOut, minOut] = horario.salida.split(':').map(Number);

    const fechaIn = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaIn, minIn);
    const fechaOut = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaOut, minOut);

    let porcentaje = 0;
    if (ahora >= fechaIn && ahora <= fechaOut) {
      const tiempoTotal = fechaOut.getTime() - fechaIn.getTime();
      const tiempoTranscurrido = ahora.getTime() - fechaIn.getTime();
      porcentaje = Math.round((tiempoTranscurrido / tiempoTotal) * 100);
    } else if (ahora > fechaOut) {
      porcentaje = 100;
    }

    this.horarioReal.set({
      tieneTurno: true,
      entrada: this.formatearAMPM(horaIn, minIn),
      salida: this.formatearAMPM(horaOut, minOut),
      progresoPorcentaje: porcentaje
    });
  }

  private formatearAMPM(hora: number, minutos: number): string {
    const ampm = hora >= 12 ? 'PM' : 'AM';
    const horaDoce = hora % 12 || 12;
    const minutosStr = String(minutos).padStart(2, '0');
    return `${String(horaDoce).padStart(2, '0')}:${minutosStr} ${ampm}`;
  }

  getIniciales(paciente: any): string {
    if (!paciente || !paciente.nombre) return 'PX';
    const n = paciente.nombre.trim().charAt(0).toUpperCase();
    const a = paciente.apellido ? paciente.apellido.trim().charAt(0).toUpperCase() : '';
    return `${n}${a}`;
  }
}