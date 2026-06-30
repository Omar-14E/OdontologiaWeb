import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-historial-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-historial-citas.html',
  styleUrls: ['./admin-historial-citas.css']
})
export class AdminHistorialCitasComponent implements OnInit {
  
  citas = signal<any[]>([]);

  // 🌟 Signals para controlar los Filtros
  filtroTexto = signal<string>('');
  filtroEspecialidad = signal<string>('');
  filtroFechaInicio = signal<string>('');
  filtroFechaFin = signal<string>('');
  
  mostrarTodos = signal<boolean>(false);

  especialidadesEnum = [
    'GENERAL', 'ORTODONCIA', 'ENDODONCIA', 
    'PERIODONCIA', 'CIRUGIA', 'ODONTOPEDIATRIA'
  ];

  // Métricas del reporte
  totalCitas = computed(() => this.citas().length);
  citasPendientes = computed(() => this.citas().filter(c => c.estado === 'PENDIENTE').length);
  citasRealizadas = computed(() => this.citas().filter(c => c.estado === 'ATENDIDA').length);
  citasCanceladas = computed(() => this.citas().filter(c => c.estado === 'CANCELADA').length);

  // 🌟 MAGIA COMPUTADA 1: Aplica TODOS los filtros al mismo tiempo
  citasFiltradas = computed(() => {
    let resultado = this.citas();

    // 1. Filtrado por Texto (Nombre, Apellido, DNI)
    const texto = this.filtroTexto().toLowerCase().trim();
    if (texto) {
      resultado = resultado.filter(c => 
        c.paciente.nombre.toLowerCase().includes(texto) ||
        c.paciente.apellido.toLowerCase().includes(texto) ||
        c.paciente.dni.includes(texto)
      );
    }

    // 2. Filtrado por Especialidad
    const esp = this.filtroEspecialidad();
    if (esp) {
      resultado = resultado.filter(c => c.odontologo.especialidad === esp);
    }

    // 3. Filtrado por Rango de Fechas
    const fInicio = this.filtroFechaInicio();
    const fFin = this.filtroFechaFin();
    
    if (fInicio || fFin) {
      resultado = resultado.filter(c => {
        // Extraemos solo la parte "YYYY-MM-DD" de la fechaHora de Spring Boot
        const fechaCita = c.fechaHora.split('T')[0]; 
        
        let cumpleInicio = true;
        let cumpleFin = true;

        if (fInicio) cumpleInicio = fechaCita >= fInicio;
        if (fFin) cumpleFin = fechaCita <= fFin;

        return cumpleInicio && cumpleFin;
      });
    }

    return resultado;
  });

  // 🌟 MAGIA COMPUTADA 2: Recorta el resultado para la paginación (Máx 5)
  citasFiltradasYRecortadas = computed(() => {
    const resultado = this.citasFiltradas();
    if (!this.mostrarTodos()) {
      return resultado.slice(0, 5);
    }
    return resultado;
  });

  // 🌟 MAGIA COMPUTADA 3: Verifica si hay más de 5 registros para mostrar el botón "Ver Todo"
  tieneMasDeCincoRegistros = computed(() => {
    return this.citasFiltradas().length > 5;
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.adminService.getHistorialCitas().subscribe({
      next: (data) => {
        const citasOrdenadas = data.sort((a, b) => {
          return new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime();
        });
        this.citas.set(citasOrdenadas);
      },
      error: (err) => console.error('Error cargando el historial:', err)
    });
  }

  // Capturadores de eventos para actualizar las Signals
  onBuscarTexto(event: any): void { this.filtroTexto.set(event.target.value); }
  onFiltrarEspecialidad(event: any): void { this.filtroEspecialidad.set(event.target.value); }
  onFiltrarFechaInicio(event: any): void { this.filtroFechaInicio.set(event.target.value); }
  onFiltrarFechaFin(event: any): void { this.filtroFechaFin.set(event.target.value); }

  toggleMostrarTodos(): void {
    this.mostrarTodos.set(!this.mostrarTodos());
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroEspecialidad.set('');
    this.filtroFechaInicio.set('');
    this.filtroFechaFin.set('');
    this.mostrarTodos.set(false);
  }

  formatearFechaHora(fechaHoraISO: string): { fecha: string, hora: string } {
    if (!fechaHoraISO) return { fecha: '-', hora: '-' };
    const dateObj = new Date(fechaHoraISO);
    return {
      fecha: dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
      hora: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  }
}