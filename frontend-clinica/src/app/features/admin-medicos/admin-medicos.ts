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
  styleUrls: ['./admin-medicos.css'],
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

  // 🌟 NUEVO: Signals para el filtro de Especialidad 🌟
  filtroEspecialidad = signal<string>('');

  // 🌟 NUEVO: Computed para filtrar la lista en tiempo real 🌟
  odontologosFiltrados = computed(() => {
    const esp = this.filtroEspecialidad();
    const lista = this.odontologos();

    if (!esp) return lista;
    return lista.filter(medico => medico.especialidad === esp);
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
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
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

  // 🌟 NUEVO: Métodos para manejar el filtro 🌟
  onFiltrarEspecialidad(event: any): void {
    this.filtroEspecialidad.set(event.target.value);
  }

  limpiarFiltros(): void {
    this.filtroEspecialidad.set('');
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

  eliminarMedico(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará este profesional del sistema. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarOdontologo(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El registro del médico ha sido borrado exitosamente.',
              icon: 'success',
              confirmButtonColor: '#69b9aa',
            });
            this.cargarOdontologos();
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire({
              title: 'No se puede eliminar',
              text: 'Es posible que este médico tenga citas o turnos asignados actualmente.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
            });
          },
        });
      }
    });
  }
}
