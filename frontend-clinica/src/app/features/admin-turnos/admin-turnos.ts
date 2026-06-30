import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

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
      // --- LÓGICA DE EDICIÓN INDIVIDUAL ---
      if (!val.fecha || !val.horaInicio || !val.horaFin) {
        Swal.fire({
          title: 'Faltan Datos',
          text: 'Por favor complete fecha y horas para editar el turno.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }
      const turnoEditado = { fecha: val.fecha, horaInicio: val.horaInicio, horaFin: val.horaFin };
      
      this.adminService.moverTurno(this.turnoSeleccionadoId, turnoEditado).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El turno ha sido reprogramado con éxito.',
            icon: 'success',
            confirmButtonColor: '#0d9488',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarTurnos(this.odontologoSeleccionadoId!);
          this.cerrarFormulario();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar el turno.', 'error');
        }
      });

    } else {
      // --- LÓGICA DE GENERACIÓN MASIVA ---
      if (!val.fechaInicio || !val.fechaFin || !val.horaInicio || !val.horaFin) {
        Swal.fire({
          title: 'Faltan Datos',
          text: 'Debe seleccionar un rango de fechas y un horario base.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      const start = new Date(val.fechaInicio + 'T00:00:00');
      const end = new Date(val.fechaFin + 'T00:00:00');
      const turnosAGuardar = [];

      while (start <= end) {
        const diaSemana = start.getDay(); 
        if (val.dias[diaSemana]) {
          turnosAGuardar.push({
            fecha: start.toISOString().split('T')[0], 
            horaInicio: val.horaInicio,
            horaFin: val.horaFin
          });
        }
        start.setDate(start.getDate() + 1); 
      }

      if (turnosAGuardar.length === 0) {
        Swal.fire({
          title: 'Sin coincidencias',
          text: 'No hay días que coincidan con su selección en este rango de fechas.',
          icon: 'info',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }

      const peticiones = turnosAGuardar.map(turno => 
        this.adminService.asignarTurno(this.odontologoSeleccionadoId!, turno)
      );

      forkJoin(peticiones).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Generación Exitosa!',
            text: `Se generaron ${turnosAGuardar.length} turnos para el Medico.`,
            icon: 'success',
            confirmButtonColor: '#0d9488',
            confirmButtonText: 'Genial'
          });
          this.cargarTurnos(this.odontologoSeleccionadoId!);
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            title: 'Oops...',
            text: 'Hubo un error al generar los turnos. Revisa tu conexión o intenta con un rango menor.',
            icon: 'error',
            confirmButtonColor: '#0d9488'
          });
        }
      });
    }
  }

  eliminarTurno(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Eliminarás este horario de atención y no se podrá recuperar.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarTurno(id).subscribe(() => {
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El turno ha sido borrado de la agenda.',
            icon: 'success',
            confirmButtonColor: '#0d9488',
            timer: 2000,
            showConfirmButton: false
          });
          if (this.odontologoSeleccionadoId) {
            this.cargarTurnos(this.odontologoSeleccionadoId);
          }
        });
      }
    });
  }

  getFechaMinimaActual(): string {
    return new Date().toISOString().split('T')[0];
  }
}