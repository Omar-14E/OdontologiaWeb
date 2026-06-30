import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-pacientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-pacientes.html',
  styleUrls: ['./admin-pacientes.css']
})
export class AdminPacientesComponent implements OnInit {
  
  pacientes = signal<any[]>([]);
  
  pacienteForm: FormGroup;
  modoEdicion: boolean = false;
  pacienteSeleccionadoId: number | null = null;
  mostrarFormulario: boolean = false;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    // Hemos removido el email y añadido las regex exactas de tu Spring Boot
    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^9[0-9]{8}$/)]]
    });
  }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.adminService.getPacientes().subscribe({
      next: (data) => this.pacientes.set(data),
      error: (err) => console.error('Error cargando pacientes:', err)
    });
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
    if (this.pacienteForm.invalid) return;

    if (this.modoEdicion && this.pacienteSeleccionadoId) {
      this.adminService.actualizarPaciente(this.pacienteSeleccionadoId, this.pacienteForm.value)
        .subscribe(() => {
          this.cargarPacientes();
          this.cerrarFormulario();
        });
    } else {
      this.adminService.crearPaciente(this.pacienteForm.value)
        .subscribe(() => {
          this.cargarPacientes();
          this.cerrarFormulario();
        });
    }
  }

  eliminarPaciente(id: number): void {
    if (confirm('¿Estás seguro de eliminar este paciente?')) {
      this.adminService.eliminarPaciente(id).subscribe(() => {
        this.cargarPacientes();
      });
    }
  }
}