import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-medicos.html', 
  styleUrls: ['./admin-medicos.css']
})
export class AdminMedicosComponent implements OnInit {
  
  odontologos = signal<any[]>([]);
  especialidadesEnum = ['GENERAL', 'ORTODONCIA', 'ENDODONCIA', 'PERIODONCIA', 'CIRUGIA', 'ODONTOPEDIATRIA'];
  
  medicoForm: FormGroup;
  modoEdicion: boolean = false;
  medicoSeleccionadoId: number | null = null;
  mostrarFormulario: boolean = false;

  // NUEVAS VARIABLES PARA CREDENCIALES
  mostrarCredenciales: boolean = false;
  medicoRecienCreado: any = null;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.medicoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      especialidad: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^9[0-9]{8}$/)]] 
    });
  }

  ngOnInit(): void {
    this.cargarOdontologos();
  }

  cargarOdontologos(): void {
    this.adminService.getOdontologos().subscribe({
      next: (data) => this.odontologos.set(data),
      error: (err) => console.error('Error cargando médicos:', err)
    });
  }

  abrirFormulario(medico?: any): void {
    this.mostrarFormulario = true;
    if (medico) {
      this.modoEdicion = true;
      this.medicoSeleccionadoId = medico.id;
      this.medicoForm.patchValue(medico);
    } else {
      this.modoEdicion = false;
      this.medicoSeleccionadoId = null;
      this.medicoForm.reset();
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.medicoForm.reset();
  }

  // MÉTODO PARA CERRAR EL MODAL DE CREDENCIALES
  cerrarCredenciales(): void {
    this.mostrarCredenciales = false;
    this.medicoRecienCreado = null;
  }

  guardarMedico(): void {
    if (this.medicoForm.invalid) return;

    if (this.modoEdicion && this.medicoSeleccionadoId) {
      this.adminService.actualizarOdontologo(this.medicoSeleccionadoId, this.medicoForm.value)
        .subscribe(() => {
          this.cargarOdontologos();
          this.cerrarFormulario();
        });
    } else {
      this.adminService.crearOdontologo(this.medicoForm.value)
        .subscribe((response: any) => {
          
          console.log("ESTO LLEGA DE JAVA:", response); // <--- AÑADE ESTO

          this.cargarOdontologos();
          this.cerrarFormulario();
          
          this.medicoRecienCreado = {
            nombre: response.nombre,
            apellido: response.apellido,
            usuario: response.usuario?.username, 
            email: response.usuario?.gmail       
          };
          
          this.mostrarCredenciales = true;
        });
    }
  }

  eliminarMedico(id: number): void {
    if (confirm('¿Estás seguro de eliminar este médico/odontólogo?')) {
      this.adminService.eliminarOdontologo(id).subscribe(() => {
        this.cargarOdontologos();
      });
    }
  }
}