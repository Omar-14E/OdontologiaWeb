import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CitaService } from '../../../services/cita';
import { PacienteService } from '../../../services/paciente';
import { OdontologoService } from '../../../services/odontologo';
import { Paciente } from '../../../models/paciente';
import { Odontologo } from '../../../models/odontologo';

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

  // Colecciones dinámicas para cargar en los selectores del HTML
  listaPacientes: Paciente[] = [];
  listaOdontologos: Odontologo[] = [];

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private odontologoService: OdontologoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.citaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      odontologoId: ['', Validators.required],
      fechaHora: ['', Validators.required],
      motivoConsulta: ['', [Validators.required, Validators.minLength(5)]], // Campo solicitado para diagnóstico preliminar
      estado: ['PENDIENTE', Validators.required]
    });

    // Cargar listas desplegables desde la base de datos
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
      next: (data) => this.listaPacientes = data,
      error: (err) => console.error('Error al cargar pacientes', err)
    });

    this.odontologoService.getOdontologos().subscribe({
      next: (data) => this.listaOdontologos = data,
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

        // Declaramos payloadCita como "any" para saltar la restricción estricta de TypeScript
        const payloadCita: any = {
          fechaHora: valores.fechaHora,
          estado: valores.estado,
          // Si añadiste motivoConsulta a tu Cita.java en Spring Boot, descomenta la siguiente línea:
          // motivoConsulta: valores.motivoConsulta,
          paciente: { id: Number(valores.pacienteId) },
          odontologo: { id: Number(valores.odontologoId) }
        };

        if (this.idCitaEditar) {
          this.citaService.updateCita(this.idCitaEditar, payloadCita).subscribe({
            next: () => {
              alert('Cita reprogramada con éxito');
              this.router.navigate(['/citas']);
            },
            error: (err) => alert('Error al actualizar cita: ' + err.error?.message)
          });
        } else {
          this.citaService.createCita(payloadCita).subscribe({
            next: () => {
              alert('Cita agendada de forma correcta');
              this.router.navigate(['/citas']);
            },
            error: (err) => alert('Error al registrar cita: ' + err.error?.message)
          });
        }
      } else {
        this.citaForm.markAllAsTouched();
      }
    }
}
