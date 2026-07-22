import { Component, OnInit, signal, computed} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-medicos.html',
  styleUrls: ['./admin-medicos.scss'],
})
export class AdminMedicosComponent implements OnInit {
  odontologos = signal<any[]>([]);
  especialidadesEnum = [
    'GENERAL',
    'ORTODONCIA',
    'ENDODONCIA',
    'PERIODONCIA',
    'CIRUGIA',
    'ODONTOPEDIATRIA',
  ];

  filtroEspecialidad = signal<string>('');
  filtroEstado = signal<string>('');

  odontologosFiltrados = computed(() => {
    const esp = this.filtroEspecialidad();
    const estado = this.filtroEstado();
    let lista = this.odontologos();

    if (esp) {
      lista = lista.filter(medico => medico.especialidad === esp);
    }

    if (estado === 'activo') {
      lista = lista.filter(medico => medico.activo === true);
    } else if (estado === 'inactivo') {
      lista = lista.filter(medico => medico.activo === false);
    }

    return lista;
  });

  medicoForm: FormGroup;
  modoEdicion: boolean = false;
  medicoSeleccionadoId: number | null = null;
  mostrarFormulario: boolean = false;

  mostrarCredenciales: boolean = false;
  medicoRecienCreado: any = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
  ) {
    this.medicoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      especialidad: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^9[0-9]{8}$/)]],
    });
  }

  ngOnInit(): void {
    this.cargarOdontologos();
  }

  cargarOdontologos(): void {
    this.adminService.getOdontologos().subscribe({
      next: (data) => this.odontologos.set(data),
      error: (err) => console.error('Error cargando médicos:', err),
    });
  }

  onFiltrarEspecialidad(event: any): void {
    this.filtroEspecialidad.set(event.target.value);
  }

  onFiltrarEstado(event: any): void {
    this.filtroEstado.set(event.target.value);
  }

  limpiarFiltros(): void {
    this.filtroEspecialidad.set('');
    this.filtroEstado.set('');
  }

  abrirFormulario(medico?: any): void {
    this.mostrarFormulario = true;
    if (medico) {
      this.modoEdicion = true;
      this.medicoSeleccionadoId = medico.id;
      this.medicoForm.patchValue(medico);
    } else {
      this.modoEdicion = false;
      this.medicoSeleccionadoId = null;
      this.medicoForm.reset();
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.medicoForm.reset();
  }

  cerrarCredenciales(): void {
    this.mostrarCredenciales = false;
    this.medicoRecienCreado = null;
  }

  guardarMedico(): void {
    if (this.medicoForm.invalid) return;

    if (this.modoEdicion && this.medicoSeleccionadoId) {
      this.adminService
        .actualizarOdontologo(this.medicoSeleccionadoId, this.medicoForm.value)
        .subscribe(() => {
          this.cargarOdontologos();
          this.cerrarFormulario();
        });
    } else {
      this.adminService.crearOdontologo(this.medicoForm.value).subscribe((response: any) => {
        console.log('ESTO LLEGA DE JAVA:', response); 

        this.cargarOdontologos();
        this.cerrarFormulario();

        this.medicoRecienCreado = {
          nombre: response.nombre,
          apellido: response.apellido,
          usuario: response.usuario?.username,
          email: response.usuario?.gmail,
        };

        this.mostrarCredenciales = true;
      });
    }
  }

  cambiarEstado(medico: any): void {
    const estaActivo = medico.activo;
    const accion = estaActivo ? 'desactivar' : 'activar';
    const nombreCompleto = `Dr/a. ${medico.nombre} ${medico.apellido}`;

    Swal.fire({
      title: `¿${estaActivo ? 'Desactivar' : 'Activar'} profesional?`,
      text: estaActivo
        ? `${nombreCompleto} será marcado como inactivo y no aparecerá disponible en el sistema.`
        : `${nombreCompleto} será reactivado y volverá a estar disponible en el sistema.`,
      icon: estaActivo ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: estaActivo ? '#f59e0b' : '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: estaActivo ? 'Sí, desactivar' : 'Sí, activar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.cambiarEstadoOdontologo(medico.id).subscribe({
          next: () => {
            Swal.fire({
              title: estaActivo ? '¡Desactivado!' : '¡Activado!',
              text: estaActivo
                ? `${nombreCompleto} ha sido marcado como inactivo.`
                : `${nombreCompleto} ha sido reactivado exitosamente.`,
              icon: 'success',
              confirmButtonColor: '#69b9aa',
            });
            this.cargarOdontologos();
          },
          error: (err) => {
            console.error('Error al cambiar estado:', err);
            Swal.fire({
              title: 'Error',
              text: `No se pudo ${accion} al profesional. Intente de nuevo.`,
              icon: 'error',
              confirmButtonColor: '#ef4444',
            });
          },
        });
      }
    });
  }
}

