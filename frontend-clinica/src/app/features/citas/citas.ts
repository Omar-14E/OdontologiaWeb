import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css']
})
export class CitasComponent implements OnInit {
  
  // Señales de las bases de datos
  pacientes = signal<any[]>([]);
  odontologos = signal<any[]>([]);
  citasAgendadas = signal<any[]>([]);
  
  // Señal DINÁMICA que solo contiene los médicos de la especialidad elegida
  odontologosFiltrados = signal<any[]>([]);

  especialidadesEnum = [
    'GENERAL', 'ORTODONCIA', 'ENDODONCIA', 
    'PERIODONCIA', 'CIRUGIA', 'ODONTOPEDIATRIA'
  ];

  citaForm: FormGroup;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.citaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      especialidad: ['', Validators.required],
      // Inicia deshabilitado. Se habilitará cuando elijan especialidad.
      odontologoId: [{value: '', disabled: true}, Validators.required], 
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      observaciones: ['']
    });

    // 🌟 MAGIA REACTIVA: Escuchar los cambios en el select de Especialidad
    this.citaForm.get('especialidad')?.valueChanges.subscribe(especialidadSeleccionada => {
      if (especialidadSeleccionada) {
        
        // Filtramos el arreglo maestro de odontologos
        const filtrados = this.odontologos().filter(medico => medico.especialidad === especialidadSeleccionada);
        this.odontologosFiltrados.set(filtrados);
        
        // Habilitamos el selector de médicos y reseteamos el valor anterior
        this.citaForm.get('odontologoId')?.enable();
        this.citaForm.get('odontologoId')?.setValue('');
        
      } else {
        // Si borran la especialidad, volvemos a bloquear el selector de médicos
        this.citaForm.get('odontologoId')?.disable();
        this.odontologosFiltrados.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarCitas();
  }

  cargarCatalogos(): void {
    this.adminService.getPacientes().subscribe(data => this.pacientes.set(data));
    this.adminService.getOdontologos().subscribe(data => this.odontologos.set(data));
  }

  cargarCitas(): void {
    this.adminService.getHistorialCitas().subscribe({
      next: (data) => {
        const citasRecientes = data.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
        this.citasAgendadas.set(citasRecientes);
      },
      error: (err) => console.error('Error cargando citas', err)
    });
  }

  guardarCita(): void {
    if (this.citaForm.invalid) {
      Swal.fire('Faltan Datos', 'Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }

    const val = this.citaForm.value;
    
    // 1. Unimos fecha y hora (ej: 2026-07-15T14:30:00) para el backend
    const fechaHoraFormateada = `${val.fecha}T${val.hora}:00`;

    // 2. Construimos el JSON exacto que pide Spring Boot para relacionar entidades
    const nuevaCita = {
      fechaHora: fechaHoraFormateada,
      estado: 'PENDIENTE',
      observaciones: val.observaciones,
      paciente: { id: val.pacienteId },
      odontologo: { id: val.odontologoId }
    };

    // 3. Enviamos al servidor
    this.adminService.crearCita(nuevaCita).subscribe({
      next: () => {
        Swal.fire('¡Agendada!', 'La cita ha sido registrada con éxito en la agenda del doctor.', 'success');
        this.cargarCitas();
        
        // Limpiamos el formulario para la siguiente cita sin ocultarlo
        this.citaForm.reset({ pacienteId: '', especialidad: '', odontologoId: '', fecha: '', hora: '', observaciones: '' });
        this.citaForm.get('odontologoId')?.disable(); // Volvemos a bloquear el médico
      },
      error: (err) => {
        // Aprovechamos los mensajes de error potentes de Spring Boot
        const mensajeBackend = err.error?.message || err.error || 'El doctor no tiene disponibilidad o está fuera de su horario.';
        Swal.fire({
          title: 'No se puede agendar',
          text: typeof mensajeBackend === 'string' ? mensajeBackend : 'Conflicto de horario.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  formatearFechaHora(fechaHoraISO: string): { fecha: string, hora: string } {
    if (!fechaHoraISO) return { fecha: '-', hora: '-' };
    const dateObj = new Date(fechaHoraISO);
    return {
      fecha: dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      hora: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  }

  getFechaMinimaActual(): string {
    return new Date().toISOString().split('T')[0];
  }
}