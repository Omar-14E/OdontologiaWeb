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
    // Formulario limpio sin observaciones según captura original
    this.citaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      especialidad: ['', Validators.required],
      odontologoId: [{value: '', disabled: true}, Validators.required], 
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    // 🌟 INTERCEPTOR REACTIVO: Escucha si seleccionan la opción especial de agregar paciente
    this.citaForm.get('pacienteId')?.valueChanges.subscribe(pacienteId => {
      if (pacienteId === 'NUEVO_PACIENTE') {
        this.abrirModalPaciente();
      }
    });

    // 🌟 MAGIA REACTIVA: Escuchar los cambios en el select de Especialidad
    this.citaForm.get('especialidad')?.valueChanges.subscribe(especialidadSeleccionada => {
      if (especialidadSeleccionada) {
        const filtrados = this.odontologos().filter(medico => medico.especialidad === especialidadSeleccionada);
        this.odontologosFiltrados.set(filtrados);
        this.citaForm.get('odontologoId')?.enable();
        this.citaForm.get('odontologoId')?.setValue('');
      } else {
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

  // 🚀 METODO MODAL INTERACTIVO CON SWEETALERT2 CORREGIDO Y ESTILIZADO NATIVO
  abrirModalPaciente(): void {
    Swal.fire({
      title: 'Registrar Nuevo Paciente',
      confirmButtonColor: '#69b9aa',
      cancelButtonColor: '#64748b',
      showCancelButton: true,
      confirmButtonText: 'Guardar Paciente',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      html: `
        <div class="swal-form-body" style="text-align: left; display: flex; flex-direction: column; gap: 0.8rem; font-family: 'Inter', sans-serif;">
          <div class="swal-input-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
            <label class="swal-label" style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Nombre *</label>
            <input id="swal-nombre" class="swal2-input" placeholder="Ej. Juan" style="margin: 0; width: 100%; box-sizing: border-box; height: 42px; font-size: 0.9rem;">
          </div>
          <div class="swal-input-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
            <label class="swal-label" style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Apellido *</label>
            <input id="swal-apellido" class="swal2-input" placeholder="Ej. Pérez" style="margin: 0; width: 100%; box-sizing: border-box; height: 42px; font-size: 0.9rem;">
          </div>
          <div class="swal-input-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
            <label class="swal-label" style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">DNI * (8 dígitos)</label>
            <input id="swal-dni" class="swal2-input" placeholder="Ej. 74859623" maxlength="8" style="margin: 0; width: 100%; box-sizing: border-box; height: 42px; font-size: 0.9rem;">
          </div>
          <div class="swal-input-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
            <label class="swal-label" style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Teléfono * (9 dígitos)</label>
            <input id="swal-telefono" class="swal2-input" placeholder="Ej. 985632147" maxlength="9" style="margin: 0; width: 100%; box-sizing: border-box; height: 42px; font-size: 0.9rem;">
          </div>
        </div>
      `,
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value.trim();
        const apellido = (document.getElementById('swal-apellido') as HTMLInputElement).value.trim();
        const dni = (document.getElementById('swal-dni') as HTMLInputElement).value.trim();
        const telefono = (document.getElementById('swal-telefono') as HTMLInputElement).value.trim();

        // Validaciones idénticas a las restricciones RegEx de tu backend
        if (!nombre || !apellido || !dni || !telefono) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
          Swal.showValidationMessage('El nombre solo puede contener letras');
          return false;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
          Swal.showValidationMessage('El apellido solo puede contener letras');
          return false;
        }
        if (!/^[0-9]{8}$/.test(dni)) {
          Swal.showValidationMessage('El DNI debe contar con 8 dígitos');
          return false;
        }
        if (!/^9[0-9]{8}$/.test(telefono)) {
          Swal.showValidationMessage('El teléfono debe tener 9 dígitos y empezar con el número 9');
          return false;
        }

        return { nombre, apellido, dni, telefono };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // Guardamos en la base de datos usando tu método real
        this.adminService.crearPaciente(result.value).subscribe({
          next: (pacienteCreado) => {
            Swal.fire({
              title: '¡Registrado!',
              text: 'El paciente ha sido guardado exitosamente.',
              icon: 'success',
              confirmButtonColor: '#69b9aa'
            });
            
            // Recargamos catálogo completo actualizado
            this.adminService.getPacientes().subscribe(data => {
              this.pacientes.set(data);
              // Selección automática evitando bucles de eventos ({ emitEvent: false })
              this.citaForm.get('pacienteId')?.setValue(pacienteCreado.id, { emitEvent: false });
            });
          },
          error: (err) => {
            const mensajeBackend = err.error?.message || err.error || 'Ocurrió un problema de duplicidad o conexión.';
            Swal.fire({
              title: 'Error al guardar',
              text: mensajeBackend,
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
            this.citaForm.get('pacienteId')?.setValue('');
          }
        });
      } else {
        // Si el administrador cancela, regresamos el select al estado inicial vacío
        this.citaForm.get('pacienteId')?.setValue('');
      }
    });
  }

  guardarCita(): void {
    if (this.citaForm.invalid) {
      Swal.fire('Faltan Datos', 'Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }

    const val = this.citaForm.value;
    const fechaHoraFormateada = `${val.fecha}T${val.hora}:00`;

    // Estructura exacta requerida por Spring Boot (observaciones por defecto va vacío)
    const nuevaCita = {
      fechaHora: fechaHoraFormateada,
      estado: 'PENDIENTE',
      observaciones: '', 
      paciente: { id: val.pacienteId },
      odontologo: { id: val.odontologoId }
    };

    this.adminService.crearCita(nuevaCita).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Agendada!',
          text: 'La cita ha sido registrada con éxito en la agenda del doctor.',
          icon: 'success',
          confirmButtonColor: '#69b9aa'
        });
        this.cargarCitas();
        this.citaForm.reset({ pacienteId: '', especialidad: '', odontologoId: '', fecha: '', hora: '' });
        this.citaForm.get('odontologoId')?.disable();
      },
      error: (err) => {
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