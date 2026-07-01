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
  styleUrls: ['./citas.scss'],
})
export class CitasComponent implements OnInit {
  pacientes = signal<any[]>([]);
  odontologos = signal<any[]>([]);
  citasAgendadas = signal<any[]>([]);

  odontologosFiltrados = signal<any[]>([]);

  horariosDisponibles = signal<string[]>([]);
  buscandoHorarios = signal<boolean>(false);

  especialidadesEnum = [
    'GENERAL',
    'ORTODONCIA',
    'ENDODONCIA',
    'PERIODONCIA',
    'CIRUGIA',
    'ODONTOPEDIATRIA',
  ];

  citaForm: FormGroup;

  idCitaEdicion: number | null = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
  ) {
    this.citaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      especialidad: ['', Validators.required],
      odontologoId: [{ value: '', disabled: true }, Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
    });

    this.citaForm.get('especialidad')?.valueChanges.subscribe((especialidadSeleccionada) => {
      if (especialidadSeleccionada) {
        const filtrados = this.odontologos().filter(
          (medico) => medico.especialidad === especialidadSeleccionada,
        );
        this.odontologosFiltrados.set(filtrados);
        this.citaForm.get('odontologoId')?.enable();

        const currentOdontologo = this.citaForm.get('odontologoId')?.value;
        if (!filtrados.find((m) => m.id === currentOdontologo)) {
          this.citaForm.get('odontologoId')?.setValue('');
        }
      } else {
        this.citaForm.get('odontologoId')?.disable();
        this.odontologosFiltrados.set([]);
      }
    });

    this.citaForm.valueChanges.subscribe((valores) => {
      if (valores.odontologoId && valores.fecha) {
        this.buscarHorariosDisponibles(valores.odontologoId, valores.fecha);
      } else {
        this.horariosDisponibles.set([]); 
      }
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarCitas();
  }

  cargarCatalogos(): void {
    this.adminService.getPacientes().subscribe((data) => this.pacientes.set(data));
    this.adminService.getOdontologos().subscribe((data) => this.odontologos.set(data));
  }

  cargarCitas(): void {
    this.adminService.getHistorialCitas().subscribe({
      next: (data) => {
        const { inicio, fin } = this.obtenerLimitesSemana();

        const citasDeEstaSemana = data.filter((cita) => {
          const fechaCita = new Date(cita.fechaHora);
          return fechaCita >= inicio && fechaCita <= fin;
        });

        const citasRecientes = citasDeEstaSemana.sort(
          (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
        );

        this.citasAgendadas.set(citasRecientes);
      },
      error: (err) => console.error('Error cargando citas', err),
    });
  }

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
            <label class="swal-label" style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Nombre * (Mín. 3 letras)</label>
            <input id="swal-nombre" class="swal2-input" placeholder="Ej. Juan" style="margin: 0; width: 100%; box-sizing: border-box; height: 42px; font-size: 0.9rem;">
          </div>
          <div class="swal-input-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
            <label class="swal-label" style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Apellido * (Mín. 3 letras)</label>
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

        if (!nombre || !apellido || !dni || !telefono) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        // 👇 NUEVAS VALIDACIONES DE LONGITUD MÍNIMA 👇
        if (nombre.length < 3) {
          Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres');
          return false;
        }
        if (apellido.length < 3) {
          Swal.showValidationMessage('El apellido debe tener al menos 3 caracteres');
          return false;
        }
        // ---------------------------------------------

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
          Swal.showValidationMessage('El teléfono debe tener 9 dígitos y empezar con 9');
          return false;
        }

        return { nombre, apellido, dni, telefono };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.adminService.crearPaciente(result.value).subscribe({
          next: (pacienteCreado) => {
            Swal.fire({
              title: '¡Registrado!',
              text: 'El paciente ha sido guardado exitosamente.',
              icon: 'success',
              confirmButtonColor: '#69b9aa',
            });

            this.adminService.getPacientes().subscribe((data) => {
              this.pacientes.set(data);
              this.citaForm.get('pacienteId')?.setValue(pacienteCreado.id, { emitEvent: false });
            });
          },
          error: (err) => {
            const mensajeBackend =
              err.error?.message || err.error || 'Ocurrió un problema de duplicidad o conexión.';
            Swal.fire({
              title: 'Error al guardar',
              text: mensajeBackend,
              icon: 'error',
              confirmButtonColor: '#ef4444',
            });
            this.citaForm.get('pacienteId')?.setValue('');
          },
        });
      } else {
        this.citaForm.get('pacienteId')?.setValue('');
      }
    });
  }
  
  buscarHorariosDisponibles(odontologoId: number, fecha: string): void {
    this.buscandoHorarios.set(true);
    this.adminService.getDisponibilidad(odontologoId, fecha).subscribe({
      next: (horas: string[]) => {
        this.horariosDisponibles.set(horas);
        this.buscandoHorarios.set(false);
      },
      error: (err) => {
        console.error('Error al buscar horarios', err);
        this.horariosDisponibles.set([]);
        this.buscandoHorarios.set(false);
      },
    });
  }

  seleccionarHora(horaSeleccionada: string): void {
    this.citaForm.patchValue({ hora: horaSeleccionada });
  }

  // GUARDAR O ACTUALIZAR CITA
  guardarCita(): void {
    if (this.citaForm.invalid) {
      Swal.fire('Faltan Datos', 'Por favor selecciona la fecha y una hora disponible.', 'warning');
      return;
    }

    const val = this.citaForm.value;

    let fechaReal = new Date(`${val.fecha}T00:00:00`);
    let horaNumerica = parseInt(val.hora.substring(0, 2));

    // Si elige una hora de madrugada (00:00, 01:00), le sumamos 1 día automáticamente
    if (horaNumerica >= 0 && horaNumerica < 6) {
      fechaReal.setDate(fechaReal.getDate() + 1);
    }

    // Volvemos a extraer la fecha ya corregida en formato YYYY-MM-DD
    const mes = String(fechaReal.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaReal.getDate()).padStart(2, '0');
    const fechaCorregida = `${fechaReal.getFullYear()}-${mes}-${dia}`;
    
    const fechaHoraFormateada = `${fechaCorregida}T${val.hora}:00`;

    const datosCita = {
      fechaHora: fechaHoraFormateada,
      estado: 'PENDIENTE',
      observaciones: '',
      paciente: { id: val.pacienteId },
      odontologo: { id: val.odontologoId },
    };

    if (this.idCitaEdicion) {
      this.adminService.actualizarCita(this.idCitaEdicion, datosCita).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Actualizada!',
            text: 'La cita ha sido modificada con éxito.',
            icon: 'success',
            confirmButtonColor: '#69b9aa',
          });
          this.resetearFormulario();
        },
        error: (err) => this.mostrarErrorCita(err),
      });
    } else {
      this.adminService.crearCita(datosCita).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Agendada!',
            text: 'La cita ha sido registrada con éxito en la agenda del doctor.',
            icon: 'success',
            confirmButtonColor: '#69b9aa',
          });
          this.resetearFormulario();
        },
        error: (err) => this.mostrarErrorCita(err),
      });
    }
  }

  // EDITAR CITA
  editarCita(cita: any): void {
    this.idCitaEdicion = cita.id;

    const [fechaCita, horaCompleta] = cita.fechaHora.split('T');
    const horaCita = horaCompleta.substring(0, 5);

    const odontologoSeleccionado = this.odontologos().find((med) => med.id === cita.odontologo.id);

    this.citaForm.patchValue({
      pacienteId: cita.paciente.id,
      especialidad: odontologoSeleccionado ? odontologoSeleccionado.especialidad : '',
      fecha: fechaCita,
      hora: horaCita,
    });

    setTimeout(() => {
      this.citaForm.patchValue({ odontologoId: cita.odontologo.id });
    });
  }

  // ELIMINAR CITA
  eliminarCita(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se cancelará y eliminará esta cita del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarCita(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminada!', 'La cita ha sido borrada con éxito.', 'success');
            this.cargarCitas();
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
            console.error(err);
          },
        });
      }
    });
  }

  // MÉTODOS AUXILIARES
  resetearFormulario() {
    this.cargarCitas();
    this.idCitaEdicion = null;
    this.citaForm.reset({
      pacienteId: '',
      especialidad: '',
      odontologoId: '',
      fecha: '',
      hora: '',
    });
    this.citaForm.get('odontologoId')?.disable();
  }

  mostrarErrorCita(err: any) {
    const mensajeBackend =
      err.error?.message ||
      err.error ||
      'El doctor no tiene disponibilidad o está fuera de su horario.';
    Swal.fire({
      title: 'No se puede procesar',
      text:
        typeof mensajeBackend === 'string'
          ? mensajeBackend
          : 'Conflicto de horario o indisponibilidad.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
    });
  }

  formatearFechaHora(fechaHoraISO: string): { fecha: string; hora: string } {
    if (!fechaHoraISO) return { fecha: '-', hora: '-' };
    const dateObj = new Date(fechaHoraISO);
    return {
      fecha: dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      hora: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  getFechaMinimaActual(): string {
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    return hoy.toISOString().split('T')[0];
  }

  // FILTRO DE SEMANA ACTUAL
  obtenerLimitesSemana(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const diaSemana = hoy.getDay();

    const distanciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + distanciaLunes);
    lunes.setHours(0, 0, 0, 0);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);

    return { inicio: lunes, fin: domingo };
  }
}
