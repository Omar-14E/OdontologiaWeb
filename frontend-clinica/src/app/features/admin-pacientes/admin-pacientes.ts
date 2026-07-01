import { Component, OnInit, signal, computed } from '@angular/core'; // 👈 Se añadió 'computed'
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
  
  // 🌟 NUEVO: Signals para la Búsqueda / Filtro 🌟
  filtroTexto = signal<string>('');

  // 🌟 NUEVO: Filtro reactivo para Nombre, Apellido o DNI 🌟
  pacientesFiltrados = computed(() => {
    const texto = this.filtroTexto().toLowerCase().trim();
    const lista = this.pacientes();

    if (!texto) return lista;

    return lista.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
      (p.apellido && p.apellido.toLowerCase().includes(texto)) ||
      (p.dni && p.dni.includes(texto))
    );
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

  // 🌟 NUEVOS MÉTODOS: Para capturar lo que el usuario escribe en el buscador 🌟
  onBuscarTexto(event: any): void {
    this.filtroTexto.set(event.target.value);
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
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

  // 🌟 MÉTODO MODIFICADO CON ALERTAS Y MANEJO DE ERRORES 🌟
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

  // 🌟 ELIMINACIÓN MEJORADA CON SWEETALERT EN LUGAR DE CONFIRM NATIVO 🌟
  eliminarPaciente(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará permanentemente a este paciente del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarPaciente(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El paciente ha sido borrado.', 'success');
            this.cargarPacientes();
          },
          error: (err) => {
            Swal.fire(
              'Error',
              'No se pudo eliminar al paciente (es posible que tenga citas registradas).',
              'error',
            );
            console.error(err);
          },
        });
      }
    });
  }
}