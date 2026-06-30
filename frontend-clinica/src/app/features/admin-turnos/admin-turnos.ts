import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { forkJoin } from 'rxjs'; // 👈 Importante para el generador masivo

@Component({
  selector: 'app-admin-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-turnos.html',
  styleUrls: ['./admin-turnos.css']
})
export class AdminTurnosComponent implements OnInit {
  
  odontologos = signal<any[]>([]);
  turnos = signal<any[]>([]);
  
  odontologoSeleccionadoId: number | null = null;
  turnoForm: FormGroup;
  modoEdicion: boolean = false;
  turnoSeleccionadoId: number | null = null;
  mostrarFormulario: boolean = false;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.turnoForm = this.fb.group({
      // Horarios base
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      
      // Para modo Masivo (Rango de fechas)
      fechaInicio: [''],
      fechaFin: [''],
      dias: this.fb.group({
        1: [true], // Lunes
        2: [true], // Martes
        3: [true], // Miércoles
        4: [true], // Jueves
        5: [true], // Viernes
        6: [true], // Sábado
        0: [false] // Domingo (Por defecto apagado)
      }),

      // Para modo Edición Individual
      fecha: ['']
    });
  }

  ngOnInit(): void {
    this.adminService.getOdontologos().subscribe({
      next: (data) => this.odontologos.set(data),
      error: (err) => console.error('Error cargando odontólogos', err)
    });
  }

  onOdontologoSeleccionado(event: any): void {
    const id = Number(event.target.value);
    this.odontologoSeleccionadoId = id;
    this.cerrarFormulario();
    this.cargarTurnos(id);
  }

  cargarTurnos(odontologoId: number): void {
    this.adminService.getTurnosVigentes(odontologoId).subscribe({
      next: (data) => this.turnos.set(data),
      error: (err) => console.error('Error cargando turnos', err)
    });
  }

  abrirFormularioMasivo(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.turnoSeleccionadoId = null;
    this.turnoForm.reset({
      dias: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 0: false }
    });
  }

  abrirFormularioEdicion(turno: any): void {
    this.mostrarFormulario = true;
    this.modoEdicion = true;
    this.turnoSeleccionadoId = turno.id;
    this.turnoForm.patchValue({
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin
    });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.turnoForm.reset();
  }

  guardarTurno(): void {
    if (!this.odontologoSeleccionadoId) return;
    const val = this.turnoForm.value;

    if (this.modoEdicion && this.turnoSeleccionadoId) {
      // 1. LÓGICA DE EDICIÓN INDIVIDUAL (LA EXCEPCIÓN)
      if (!val.fecha || !val.horaInicio || !val.horaFin) {
        alert("Por favor complete fecha y horas para editar.");
        return;
      }
      const turnoEditado = { fecha: val.fecha, horaInicio: val.horaInicio, horaFin: val.horaFin };
      
      this.adminService.moverTurno(this.turnoSeleccionadoId, turnoEditado).subscribe(() => {
        this.cargarTurnos(this.odontologoSeleccionadoId!);
        this.cerrarFormulario();
      });

    } else {
      // 2. LÓGICA DE GENERACIÓN MASIVA (EL PATRÓN)
      if (!val.fechaInicio || !val.fechaFin || !val.horaInicio || !val.horaFin) {
        alert("Debe seleccionar un rango de fechas y un horario base.");
        return;
      }

      // Convertimos las fechas respetando la zona horaria
      const start = new Date(val.fechaInicio + 'T00:00:00');
      const end = new Date(val.fechaFin + 'T00:00:00');
      const turnosAGuardar = [];

      // Recorremos cada día entre la fecha de inicio y fin
      while (start <= end) {
        const diaSemana = start.getDay(); // 0 es Domingo, 1 es Lunes...
        // Si el día está marcado en los checkboxes, lo agregamos a la lista
        if (val.dias[diaSemana]) {
          turnosAGuardar.push({
            fecha: start.toISOString().split('T')[0], // formato YYYY-MM-DD
            horaInicio: val.horaInicio,
            horaFin: val.horaFin
          });
        }
        start.setDate(start.getDate() + 1); // Avanzamos al siguiente día
      }

      if (turnosAGuardar.length === 0) {
        alert("⚠️ No hay días que coincidan con su selección en este rango de fechas.");
        return;
      }

      // Empaquetamos todas las peticiones a Spring Boot
      const peticiones = turnosAGuardar.map(turno => 
        this.adminService.asignarTurno(this.odontologoSeleccionadoId!, turno)
      );

      // forkJoin ejecuta todas las peticiones en paralelo
      forkJoin(peticiones).subscribe({
        next: () => {
          alert(`✅ ¡Éxito! Se generaron ${turnosAGuardar.length} turnos para el profesional.`);
          this.cargarTurnos(this.odontologoSeleccionadoId!);
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error(err);
          alert("Hubo un error al generar los turnos. Revise si hay fechas pasadas.");
        }
      });
    }
  }

  eliminarTurno(id: number): void {
    if (confirm('¿Estás seguro de eliminar este horario?')) {
      this.adminService.eliminarTurno(id).subscribe(() => {
        if (this.odontologoSeleccionadoId) this.cargarTurnos(this.odontologoSeleccionadoId);
      });
    }
  }

  getFechaMinimaActual(): string {
    return new Date().toISOString().split('T')[0];
  }
}