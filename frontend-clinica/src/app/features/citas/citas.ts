import { Component, OnInit, signal } from '@angular/core'; // 👈 Importamos signal
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css']
})
export class CitasComponent implements OnInit {
  // 👈 Convertimos los arreglos en Signals
  citas = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  odontologos = signal<any[]>([]);
  
  citaForm: FormGroup;
  modoEdicion = false;
  citaIdEditando: number | null = null;
  
  minDate: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.citaForm = this.fb.group({
      fechaHora: ['', Validators.required],
      estado: ['PENDIENTE', Validators.required],
      paciente: this.fb.group({ id: ['', Validators.required] }),
      odontologo: this.fb.group({ id: ['', Validators.required] })
    });
  }

  ngOnInit(): void {
    this.configurarFechaMinima();
    this.cargarListas();
    this.cargarCitas();
  }

  configurarFechaMinima() {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    this.minDate = ahora.toISOString().slice(0, 16);
  }

  cargarListas() {
    // 👈 Usamos .set() para actualizar las signals
    this.http.get<any[]>('http://localhost:8080/api/pacientes').subscribe(res => this.pacientes.set(res));
    this.http.get<any[]>('http://localhost:8080/api/odontologos').subscribe(res => this.odontologos.set(res));
  }

  cargarCitas() {
    // 👈 Usamos .set() para actualizar las signals
    this.http.get<any[]>('http://localhost:8080/api/citas').subscribe(res => this.citas.set(res));
  }

  guardarCita() {
    if (this.citaForm.invalid) return;

    if (this.modoEdicion && this.citaIdEditando) {
      this.http.put(`http://localhost:8080/api/citas/actualizar/${this.citaIdEditando}`, this.citaForm.value)
        .subscribe({
          next: () => {
            alert('Cita actualizada correctamente');
            this.cancelarEdicion();
            this.cargarCitas();
          },
          error: (err) => alert(err.error?.error || 'Error al actualizar cita')
        });
    } else {
      this.http.post('http://localhost:8080/api/citas/registrar', this.citaForm.value)
        .subscribe({
          next: () => {
            alert('Cita registrada correctamente');
            this.citaForm.reset({ estado: 'PENDIENTE' });
            this.cargarCitas();
          },
          error: (err) => alert(err.error?.error || 'Error al crear cita. Verifica la disponibilidad del médico.')
        });
    }
  }

  editarCita(cita: any) {
    this.modoEdicion = true;
    this.citaIdEditando = cita.id;
    
    this.citaForm.patchValue({
      fechaHora: cita.fechaHora,
      estado: cita.estado,
      paciente: { id: cita.paciente.id },
      odontologo: { id: cita.odontologo.id }
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.citaIdEditando = null;
    this.citaForm.reset({ estado: 'PENDIENTE' });
  }

  eliminarCita(id: number) {
    if(confirm('¿Estás seguro de eliminar o cancelar esta cita?')) {
      this.http.delete(`http://localhost:8080/api/citas/eliminar/${id}`).subscribe({
        next: () => this.cargarCitas(),
        error: (err) => alert('Error al eliminar la cita')
      });
    }
  }
}