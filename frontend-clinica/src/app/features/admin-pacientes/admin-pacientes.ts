import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-admin-pacientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-pacientes.html',
  styleUrls: ['./admin-pacientes.scss'],
})
export class AdminPacientesComponent implements OnInit {
  
  pacientes = signal<any[]>([]);
  
  filtroTexto = signal<string>('');
  filtroEstado = signal<string>('');

  pacientesFiltrados = computed(() => {
    const texto = this.filtroTexto().toLowerCase().trim();
    const estado = this.filtroEstado();
    let lista = this.pacientes();

    if (texto) {
      lista = lista.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
        (p.apellido && p.apellido.toLowerCase().includes(texto)) ||
        (p.dni && p.dni.includes(texto))
      );
    }

    if (estado === 'activo') {
      lista = lista.filter(p => p.activo === true);
    } else if (estado === 'inactivo') {
      lista = lista.filter(p => p.activo === false);
    }

    return lista;
  });

  pacienteForm: FormGroup;
  modoEdicion: boolean = false;
  pacienteSeleccionadoId: number | null = null;
  mostrarFormulario: boolean = false;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
  ) {
    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^9[0-9]{8}$/)]],
    });
  }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.adminService.getPacientes().subscribe({
      next: (data) => this.pacientes.set(data),
      error: (err) => console.error('Error cargando pacientes:', err),
    });
  }

  onBuscarTexto(event: any): void {
    this.filtroTexto.set(event.target.value);
  }

  onFiltrarEstado(event: any): void {
    this.filtroEstado.set(event.target.value);
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroEstado.set('');
  }

  abrirFormulario(paciente?: any): void {
    this.mostrarFormulario = true;
    if (paciente) {
      this.modoEdicion = true;
      this.pacienteSeleccionadoId = paciente.id;
      this.pacienteForm.patchValue(paciente);
    } else {
      this.modoEdicion = false;
      this.pacienteSeleccionadoId = null;
      this.pacienteForm.reset();
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.pacienteForm.reset();
  }

  guardarPaciente(): void {
    if (this.pacienteForm.invalid) {
      Swal.fire(
        'Campos inválidos',
        'Revisa que todos los datos estén correctos antes de guardar.',
        'warning',
      );
      return;
    }

    const datosPaciente = this.pacienteForm.value;

    if (this.modoEdicion && this.pacienteSeleccionadoId) {
      this.adminService.actualizarPaciente(this.pacienteSeleccionadoId, datosPaciente).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'El paciente se actualizó correctamente.', 'success');
          this.cargarPacientes();
          this.cerrarFormulario();
        },
        error: (err: any) => {
          const mensajeBackend = err.error?.message || err.error || 'Ocurrió un problema.';
          Swal.fire({
            title: 'No se pudo actualizar',
            text: typeof mensajeBackend === 'string' ? mensajeBackend : 'El DNI ya está en uso.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
          });
        },
      });
    } else {
      this.adminService.crearPaciente(datosPaciente).subscribe({
        next: () => {
          Swal.fire('¡Registrado!', 'El paciente se guardó con éxito.', 'success');
          this.cargarPacientes();
          this.cerrarFormulario();
        },
        error: (err: any) => {
          const mensajeBackend = err.error?.message || err.error || 'Ocurrió un problema.';
          Swal.fire({
            title: 'No se pudo actualizar', 
            text: typeof mensajeBackend === 'string' ? mensajeBackend : 'El DNI ya está en uso.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            didOpen: () => {
              const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
              if (swalContainer) {
                swalContainer.style.zIndex = '9999999'; 
              }
            },
          });
        },
      });
    }
  }

  cambiarEstado(paciente: any): void {
    const estaActivo = paciente.activo;
    const accion = estaActivo ? 'desactivar' : 'activar';
    const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;

    Swal.fire({
      title: `¿${estaActivo ? 'Desactivar' : 'Activar'} paciente?`,
      text: estaActivo
        ? `${nombreCompleto} será marcado como inactivo. No podrá agendar nuevas citas ni registrar atenciones, pero conservará su historial clínico.`
        : `${nombreCompleto} será reactivado. Podrá volver a agendar citas y registrar atenciones.`,
      icon: estaActivo ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: estaActivo ? '#f59e0b' : '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: estaActivo ? 'Sí, desactivar' : 'Sí, activar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.cambiarEstadoPaciente(paciente.id).subscribe({
          next: () => {
            Swal.fire({
              title: estaActivo ? '¡Desactivado!' : '¡Activado!',
              text: estaActivo
                ? `${nombreCompleto} ha sido marcado como inactivo. Su historial clínico se conserva intacto.`
                : `${nombreCompleto} ha sido reactivado exitosamente.`,
              icon: 'success',
              confirmButtonColor: '#69b9aa',
            });
            this.cargarPacientes();
          },
          error: (err) => {
            console.error('Error al cambiar estado:', err);
            Swal.fire({
              title: 'Error',
              text: `No se pudo ${accion} al paciente. Intente de nuevo.`,
              icon: 'error',
              confirmButtonColor: '#ef4444',
            });
          },
        });
      }
    });
  }
}