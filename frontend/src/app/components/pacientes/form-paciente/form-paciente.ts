import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PacienteService } from '../../../services/paciente';

@Component({
  selector: 'app-form-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-paciente.html',
  styleUrl: './form-paciente.css'
})
export class FormPacienteComponent implements OnInit {
  pacienteForm!: FormGroup;
  idPacienteEditar: number | null = null;
  tituloPantalla: string = 'Registrar Paciente';

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idPacienteEditar = Number(idParam);
      this.tituloPantalla = 'Editar Historial de Paciente';
      this.cargarDatosPaciente(this.idPacienteEditar);
    }
  }

  cargarDatosPaciente(id: number) {
    this.pacienteService.getPacienteById(id).subscribe({
      next: (paciente) => {
        this.pacienteForm.patchValue({
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          dni: paciente.dni,
          telefono: paciente.telefono
        });
      },
      error: (err) => console.error('Error al obtener datos del paciente', err)
    });
  }

  guardar(): void {
    if (this.pacienteForm.valid) {
      if (this.idPacienteEditar) {
        this.pacienteService.updatePaciente(this.idPacienteEditar, this.pacienteForm.value).subscribe({
          next: () => {
            alert('Paciente actualizado con éxito');
            this.router.navigate(['/pacientes']);
          },
          error: (err) => alert('Error al actualizar: ' + err.error?.message)
        });
      } else {
        this.pacienteService.createPaciente(this.pacienteForm.value).subscribe({
          next: () => {
            alert('Paciente registrado con éxito');
            this.router.navigate(['/pacientes']);
          },
          error: (err) => alert('Error al registrar: ' + err.error?.message)
        });
      }
    } else {
      this.pacienteForm.markAllAsTouched();
    }
  }
}
