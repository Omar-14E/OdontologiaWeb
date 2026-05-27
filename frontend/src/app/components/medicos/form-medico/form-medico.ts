import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // Añadido ActivatedRoute
import { OdontologoService } from '../../../services/odontologo';

@Component({
  selector: 'app-form-medico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-medico.html',
  styleUrl: './form-medico.css'
})
export class FormMedicoComponent implements OnInit {
  medicoForm!: FormGroup;
  idMedicoEditar: number | null = null;
  tituloPantalla: string = 'Añadir Especialista';

  constructor(
    private fb: FormBuilder,
    private odontologoService: OdontologoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.medicoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]],
      especialidad: ['GENERAL', Validators.required],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idMedicoEditar = Number(idParam);
      this.tituloPantalla = 'Editar Especialista';
      this.cargarDatosMedico(this.idMedicoEditar);
    }
  }

  cargarDatosMedico(id: number) {
    this.odontologoService.getOdontologoById(id).subscribe({
      next: (medico) => {
        this.medicoForm.patchValue({
          nombre: medico.nombre,
          apellido: medico.apellido,
          telefono: medico.telefono,
          especialidad: medico.especialidad
        });
      },
      error: (err) => console.error('Error al cargar el médico', err)
    });
  }

  guardar(): void {
    if (this.medicoForm.valid) {
      if (this.idMedicoEditar) {
        this.odontologoService.updateOdontologo(this.idMedicoEditar, this.medicoForm.value).subscribe({
          next: () => {
            alert('Médico actualizado con éxito');
            this.router.navigate(['/medicos']);
          },
          error: (err) => alert('Error al actualizar: ' + err.error?.error)
        });
      } else {
        this.odontologoService.createOdontologo(this.medicoForm.value).subscribe({
          next: () => {
            alert('Médico registrado con éxito');
            this.router.navigate(['/medicos']);
          },
          error: (err) => alert('Ocurrió un error al guardar: ' + err.error?.error)
        });
      }
    } else {
      this.medicoForm.markAllAsTouched();
    }
  }
}
