import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-medicos.html', 
  styleUrls: ['./admin-medicos.css']
})
export class AdminMedicosComponent implements OnInit {
  
  odontologos = signal<any[]>([]);
  
  // Array basado en tu Enum de Java para llenar un combobox (select)
  especialidadesEnum = [
    'GENERAL', 'ORTODONCIA', 'ENDODONCIA', 
    'PERIODONCIA', 'CIRUGIA', 'ODONTOPEDIATRIA'
  ];
  
  medicoForm: FormGroup;
  modoEdicion: boolean = false;
  medicoSeleccionadoId: number | null = null;
  mostrarFormulario: boolean = false;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.medicoForm = this.fb.group({
      // Añadimos la regex de letras que tienes en Java
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      especialidad: ['', Validators.required],
      // Cambiado 'matricula' a 'telefono' con la regex estricta de 9 dígitos empezando en 9
      telefono: ['', [Validators.required, Validators.pattern(/^9[0-9]{8}$/)]] 
    });
  }

  ngOnInit(): void {
    this.cargarOdontologos();
  }

  cargarOdontologos(): void {
    this.adminService.getOdontologos().subscribe({
      next: (data) => this.odontologos.set(data),
      error: (err) => console.error('Error cargando médicos:', err)
    });
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

  guardarMedico(): void {
    if (this.medicoForm.invalid) return;

    if (this.modoEdicion && this.medicoSeleccionadoId) {
      this.adminService.actualizarOdontologo(this.medicoSeleccionadoId, this.medicoForm.value)
        .subscribe(() => {
          this.cargarOdontologos();
          this.cerrarFormulario();
        });
    } else {
      this.adminService.crearOdontologo(this.medicoForm.value)
        .subscribe(() => {
          this.cargarOdontologos();
          this.cerrarFormulario();
        });
    }
  }

  eliminarMedico(id: number): void {
    if (confirm('¿Estás seguro de eliminar este médico/odontólogo?')) {
      this.adminService.eliminarOdontologo(id).subscribe(() => {
        this.cargarOdontologos();
      });
    }
  }
}