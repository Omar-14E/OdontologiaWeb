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
  
  // Signal con todas las citas
  citas = signal<any[]>([]);

  // Señales computadas (Se calculan solas para las tarjetas de reporte)
  totalCitas = computed(() => this.citas().length);
  citasPendientes = computed(() => this.citas().filter(c => c.estado === 'PENDIENTE').length);
  citasRealizadas = computed(() => this.citas().filter(c => c.estado === 'ATENDIDA').length);
  citasCanceladas = computed(() => this.citas().filter(c => c.estado === 'CANCELADA').length);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.adminService.getHistorialCitas().subscribe({
      next: (data) => {
        // Ordenamos las citas por fecha (las más recientes primero)
        const citasOrdenadas = data.sort((a, b) => {
          return new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime();
        });
        this.citas.set(citasOrdenadas);
      },
      error: (err) => console.error('Error cargando el historial de citas:', err)
    });
  }

  // Método para formatear la fecha y hora para que se vea bonita
  formatearFechaHora(fechaHoraISO: string): { fecha: string, hora: string } {
    if (!fechaHoraISO) return { fecha: '-', hora: '-' };
    const dateObj = new Date(fechaHoraISO);
    
    const fecha = dateObj.toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
    const hora = dateObj.toLocaleTimeString('es-ES', { 
      hour: '2-digit', minute: '2-digit' 
    });

    return { fecha, hora };
  }
}