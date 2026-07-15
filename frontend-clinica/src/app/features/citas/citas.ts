import { Component, OnInit, signal, computed } from '@angular/core';
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
        // --- NUEVA LÓGICA DE PRECIO AUTOMÁTICO ---
        switch (especialidadSeleccionada) {
          case 'ORTODONCIA':
            this.precioBase.set(100.0);
            this.montoCita.set(100.0);
            break;
          case 'ENDODONCIA':
            this.precioBase.set(150.0);
            this.montoCita.set(150.0);
            break;
          case 'PERIODONCIA':
            this.precioBase.set(120.0);
            this.montoCita.set(120.0);
            break;
          case 'CIRUGIA':
            this.precioBase.set(200.0);
            this.montoCita.set(200.0);
            break;
          case 'ODONTOPEDIATRIA':
            this.precioBase.set(80.0);
            this.montoCita.set(80.0);
            break;
          default:
            this.precioBase.set(50.0);
            this.montoCita.set(50.0); // GENERAL, etc.
        }

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

  // ==========================================
  // VARIABLES PARA LA PASARELA DE PAGO
  // ==========================================
  mostrarPasarela = signal<boolean>(false);
  metodoSeleccionado = signal<'YAPE' | 'TARJETA' | 'EFECTIVO' | null>(null);
  procesandoPago = signal<boolean>(false);
  pagoExitoso = signal<boolean>(false);
  pinIngresado = signal<string>('');
  
  // VARIABLES DE PRECIO Y COMPROBANTE
  precioBase = signal<number>(50.00); 
  montoCita = signal<number>(50.00); 
  datosComprobante = signal<any>(null);
  errorMonto = computed(() => this.montoCita() > (this.precioBase() + 100));

  // ==========================================
  // NUEVAS VARIABLES PARA LOS SIMULADORES (EFECTIVO Y POS)
  // ==========================================
  // Para Efectivo
  montoRecibido = signal<number | null>(null);
  vuelto = computed(() => {
    const recibido = this.montoRecibido() || 0;
    const total = this.montoCita();
    return recibido >= total ? Number((recibido - total).toFixed(2)) : 0;
  });

  // Para Tarjeta (POS)
  posEstado = signal<'ESPERANDO_TARJETA' | 'PIDIENDO_PIN'>('ESPERANDO_TARJETA');


  // Permite modificar el monto manualmente desde la interfaz (Para YAPE)
  actualizarMonto(event: Event): void {
    const valorIngresado = (event.target as HTMLInputElement).value;
    if (valorIngresado && !isNaN(Number(valorIngresado))) {
      this.montoCita.set(Number(valorIngresado));
    }
  }

  // ==========================================
  // LÓGICA DE LA CITA Y PASARELA
  // ==========================================

  // 1. Botón del formulario: Abre la pasarela o actualiza directo si es edición
  guardarCita(): void {
    if (this.citaForm.invalid) {
      Swal.fire('Faltan Datos', 'Por favor selecciona la fecha y una hora disponible.', 'warning');
      return;
    }

    if (this.idCitaEdicion) {
      // Si estamos editando, saltamos el pago y guardamos directo
      this.ejecutarGuardadoBackend('N/A', 'N/A');
    } else {
      // Si es una cita nueva, mostramos la pasarela de pago
      this.mostrarPasarela.set(true);
    }
  }

  // 2. Funciones del PIN Pad de Tarjeta
  seleccionarMetodo(metodo: 'YAPE' | 'TARJETA' | 'EFECTIVO' | null): void {
    this.metodoSeleccionado.set(metodo);
  }

  agregarPin(numero: string): void {
    if (this.pinIngresado().length < 4) {
      this.pinIngresado.set(this.pinIngresado() + numero);
      this.reproducirBeep(); // Llamamos al sonido
    }
  }

  borrarPin(): void {
    this.pinIngresado.set(this.pinIngresado().slice(0, -1));
  }

  // 3. Simulación y guardado final
  // 3. Simulación de pago
  simularProcesoPago(): void {
    this.procesandoPago.set(true);
    
    // Simulamos la validación del pago (2 segundos)
    setTimeout(() => {
      const metodo = this.metodoSeleccionado();
      const estadoPago = metodo === 'EFECTIVO' ? 'PENDIENTE' : 'PAGADO';
      
      // Llamamos al backend para que guarde la cita REAL
      this.ejecutarGuardadoBackend(metodo || 'EFECTIVO', estadoPago);
    }, 2000);
  }

  // 4. Conexión con el Backend
  ejecutarGuardadoBackend(metodoPago: string, estadoPago: string): void {
    const val = this.citaForm.value;

    let fechaReal = new Date(`${val.fecha}T00:00:00`);
    let horaNumerica = parseInt(val.hora.substring(0, 2));

    if (horaNumerica >= 0 && horaNumerica < 6) {
      fechaReal.setDate(fechaReal.getDate() + 1);
    }

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
      metodoPago: metodoPago,
      estadoPago: estadoPago
    };

    if (this.idCitaEdicion) {
      this.adminService.actualizarCita(this.idCitaEdicion, datosCita).subscribe({
        next: () => {
          Swal.fire({ title: '¡Actualizada!', text: 'La cita ha sido modificada con éxito.', icon: 'success', confirmButtonColor: '#69b9aa' });
          this.resetearFormulario();
        },
        error: (err) => this.mostrarErrorCita(err),
      });
    } else {
      this.adminService.crearCita(datosCita).subscribe({
        next: () => {
          // 1. Generamos el comprobante con los datos del formulario
          this.generarComprobante(metodoPago, val);
          
          // 2. Detenemos la carga y mostramos el ticket (YA NO SE CIERRA AUTOMÁTICAMENTE)
          this.procesandoPago.set(false);
          this.pagoExitoso.set(true);
          
          // 3. Limpiamos el formulario por detrás para que la tabla se actualice
          this.resetearFormulario();
        },
        error: (err) => {
          this.procesandoPago.set(false);
          this.cerrarPasarela();
          this.mostrarErrorCita(err);
        },
      });
    }
  }

  // NUEVA FUNCIÓN: Genera el Ticket
  generarComprobante(metodoPago: string, formValues: any): void {
    // Buscamos los datos completos del paciente y doctor
    const pacienteObj = this.pacientes().find(p => p.id == formValues.pacienteId);
    const doctorObj = this.odontologosFiltrados().find(d => d.id == formValues.odontologoId);

    const now = new Date();
    // Generamos un número aleatorio de 6 dígitos
    const numTransaccion = 'TXN-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    // Seteamos todos los datos para mostrarlos en el HTML
    this.datosComprobante.set({
      transaccion: numTransaccion,
      fechaTransaccion: now.toLocaleDateString('es-PE'),
      horaTransaccion: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      metodoPago: metodoPago === 'EFECTIVO' ? 'Efectivo en Clínica' : metodoPago,
      pacienteNombre: pacienteObj ? `${pacienteObj.nombre} ${pacienteObj.apellido}` : 'Paciente',
      especialidad: formValues.especialidad,
      doctorNombre: doctorObj ? `Dr(a). ${doctorObj.nombre} ${doctorObj.apellido}` : 'Especialista',
      fechaCita: formValues.fecha,
      horaCita: formValues.hora,
      total: this.montoCita()
    });
  }

  cerrarPasarela(): void {
    this.mostrarPasarela.set(false);
    this.metodoSeleccionado.set(null);
    this.pagoExitoso.set(false);
    this.pinIngresado.set('');
    this.montoRecibido.set(null); // Resetear
    this.posEstado.set('ESPERANDO_TARJETA'); // Resetear
  }

  // --- MÉTODOS SIMULADOR EFECTIVO ---
  seleccionarBillete(monto: number | 'EXACTO'): void {
    this.reproducirBeep();
    if (monto === 'EXACTO') {
      this.montoRecibido.set(this.montoCita());
    } else {
      this.montoRecibido.set(monto);
    }
  }

  actualizarMontoRecibido(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.montoRecibido.set(val);
  }

  // --- MÉTODOS SIMULADOR TARJETA (POS) ---
  simularAproximar(): void {
    this.reproducirBeep();
    // Contactless no pide PIN, pasa directo a procesar
    this.simularProcesoPago();
  }

  simularInsertar(): void {
    this.reproducirBeep();
    // Insertar chip pide PIN
    this.posEstado.set('PIDIENDO_PIN');
    this.pinIngresado.set('');
  }

  // --- SONIDO ---
  reproducirBeep(): void {
    const audio = new Audio('assets/beep.mp3'); 
    audio.volume = 0.3;
    audio.play().catch(err => console.log('Audio bloqueado', err));
  }

  
  // NUEVA FUNCIÓN: Imprimir el Ticket
  imprimirComprobante(): void {
    const contenidoTicket = document.getElementById('ticket-imprimir')?.innerHTML;
    
    if (!contenidoTicket) return;

    // Abrimos una ventana oculta para imprimir
    const ventanaImpresion = window.open('', '', 'height=600,width=400');
    
    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Comprobante de Cita</title>
            <style>
              /* Estilos optimizados para impresoras / ticketeras */
              body { 
                font-family: 'Courier New', Courier, monospace; 
                color: #000; 
                padding: 10px;
                font-size: 14px;
              }
              .ticket-header { text-align: center; margin-bottom: 15px; }
              .ticket-header h3 { margin: 5px 0; font-size: 18px; }
              .ticket-header p { margin: 0; font-size: 12px; }
              .check-icon { display: none; } /* Ocultamos el icono verde de check en el papel */
              
              .ticket-divider { 
                border-top: 1px dashed #000; 
                margin: 15px 0; 
              }
              
              .ticket-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 8px; 
              }
              .text-right { 
                text-align: right; 
                font-weight: bold; 
                max-width: 60%;
              }
              
              .ticket-total { 
                font-size: 16px; 
                font-weight: bold; 
                margin-top: 10px; 
              }
            </style>
          </head>
          <body>
            ${contenidoTicket}
            
            <div style="text-align: center; margin-top: 30px; font-size: 12px;">
              <p>Gracias por su preferencia</p>
              <p>*** DENSALUD GRACIAS ***</p>
            </div>
          </body>
        </html>
      `);
      
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      
      // Lanzamos la impresión y cerramos la ventana temporal
      setTimeout(() => {
        ventanaImpresion.print();
        ventanaImpresion.close();
      }, 250);
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
