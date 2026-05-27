import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OdontologoService } from '../../../services/odontologo';

@Component({
  selector: 'app-form-medico',
  standalone: true,
  // ¡Muy importante importar ReactiveFormsModule y RouterModule!
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-medico.html',
  styleUrl: './form-medico.css'
})
export class FormMedicoComponent implements OnInit {
  medicoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private odontologoService: OdontologoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Definimos los campos y sus validaciones (Igual que en Spring Boot)
    this.medicoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]], // Obliga a que empiece con 9 y tenga 9 dígitos
      especialidad: ['GENERAL', Validators.required],
      // Nota: No incluimos el "usuario" aquí por simplicidad en esta etapa, el backend podría asignarle uno genérico o podemos crearlo después.
    });
  }

  guardar(): void {
    if (this.medicoForm.valid) {
      this.odontologoService.createOdontologo(this.medicoForm.value).subscribe({
        next: () => {
          alert('Médico registrado con éxito');
          this.router.navigate(['/medicos']); // Redirigimos a la tabla
        },
        error: (err) => {
          alert('Ocurrió un error al guardar: ' + err.error?.error);
        }
      });
    } else {
      this.medicoForm.markAllAsTouched(); // Muestra los errores si el usuario intentó guardar vacío
    }
  }
}
