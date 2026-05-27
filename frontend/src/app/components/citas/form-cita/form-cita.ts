import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';;
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CitaService } from '../../../services/cita';
import { PacienteService } from '../../../services/paciente';
import { OdontologoService } from '../../../services/odontologo';
import { Paciente } from '../../../models/paciente';
import { Odontologo } from '../../../models/odontologo';

function fechaFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fechaSeleccionada = new Date(control.value);
  const ahora = new Date();
  return fechaSeleccionada <= ahora ? { fechaInvalida: true } : null;
}

@Component({
  selector: 'app-form-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-cita.html',
  styleUrl: './form-cita.css'
})
export class FormCitaComponent implements OnInit {
  citaForm!: FormGroup;
  idCitaEditar: number | null = null;
  tituloPantalla: string = 'Programar Cita Médica';

  listaPacientes: Paciente[] = [];
  listaOdontologos: Odontologo[] = [];

get fechaMinima(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 16);
  }

  constructor(
    private fb: FormBuilder,
        private citaService: CitaService,
        private pacienteService: PacienteService,
        private odontologoService: OdontologoService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.citaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      odontologoId: ['', Validators.required],
      fechaHora: ['', [Validators.required, fechaFuturaValidator]],
      motivoConsulta: [''],
      estado: ['PENDIENTE', Validators.required]
    });

    this.cargarSelectores();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idCitaEditar = Number(idParam);
      this.tituloPantalla = 'Reajustar Cita Médica';
      this.cargarDatosCita(this.idCitaEditar);
    }
  }

  cargarSelectores() {
      this.pacienteService.getPacientes().subscribe({
        next: (data) => {
          this.listaPacientes = data;
          this.cdr.detectChanges(); // <--- Forzamos actualización visual
        },
        error: (err) => console.error('Error al cargar pacientes', err)
      });

      this.odontologoService.getOdontologos().subscribe({
        next: (data) => {
          this.listaOdontologos = data;
          this.cdr.detectChanges(); // <--- Forzamos actualización visual
        },
        error: (err) => console.error('Error al cargar médicos', err)
      });
    }

  cargarDatosCita(id: number) {
    this.citaService.getCitaById(id).subscribe({
      next: (cita) => {
        this.citaForm.patchValue({
          pacienteId: cita.paciente?.id,
          odontologoId: cita.odontologo?.id,
          fechaHora: cita.fechaHora,
          estado: cita.estado
        });
      },
      error: (err) => console.error('Error al obtener datos de la cita', err)
    });
  }

  guardar(): void {
    if (this.citaForm.valid) {
      const valores = this.citaForm.value;

      const payloadCita: any = {
        fechaHora: valores.fechaHora,
        estado: valores.estado,
        paciente: { id: Number(valores.pacienteId) },
        odontologo: { id: Number(valores.odontologoId) }
      };

      if (this.idCitaEditar) {
        this.citaService.updateCita(this.idCitaEditar, payloadCita).subscribe({
          next: () => {
            alert('Cita reprogramada con éxito');
            this.router.navigate(['/citas']);
          },
          error: (err) => this.manejarErrorCita(err)
        });
      } else {
        this.citaService.createCita(payloadCita).subscribe({
          next: () => {
            alert('Cita agendada de forma correcta');
            this.router.navigate(['/citas']);
          },
          error: (err) => this.manejarErrorCita(err)
        });
      }
    } else {
      this.citaForm.markAllAsTouched();
      if (this.citaForm.get('fechaHora')?.hasError('fechaInvalida')) {
        alert('No puedes agendar una cita en una fecha u hora pasada.');
      } else {
        alert('Faltan campos por completar o hay errores en el formulario.');
      }
    }
  }

  manejarErrorCita(err: any) {
    console.error("Error completo del servidor:", err);
    let mensajeError = 'Error desconocido al guardar la cita.';

    if (err.error && typeof err.error === 'string') {
        mensajeError = err.error;
    } else if (err.error && err.error.message) {
        mensajeError = err.error.message;
    } else if (err.message) {
        mensajeError = err.message;
    }

    alert('No se pudo agendar: ' + mensajeError);
  }
}
