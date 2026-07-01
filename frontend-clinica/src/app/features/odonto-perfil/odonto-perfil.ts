import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-odonto-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './odonto-perfil.html',
  styleUrls: ['./odonto-perfil.css']
})
export class OdontoPerfilComponent implements OnInit {
  
  perfil = signal<any>({
    nombre: '',
    apellido: '',
    telefono: '',
    especialidad: '',
    username: '',
    gmail: ''
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.cargarPerfil();
    }
  }

  cargarPerfil() {
    this.http.get('http://localhost:8080/api/mi-perfil/detalles').subscribe({
      next: (data: any) => this.perfil.set(data),
      error: (err) => console.error('Error al cargar detalles del perfil:', err)
    });
  }

  abrirModalContrasena(): void {
    Swal.fire({
      title: 'Cambiar Contraseña',
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#64748b',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      html: `
        <div class="swal-form-body" style="text-align: left; display: flex; flex-direction: column; gap: 0.8rem; font-family: 'Inter', sans-serif;">
          <div class="swal-input-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
            <label style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Contraseña Actual *</label>
            <input id="swal-current-pass" type="password" class="swal2-input" placeholder="Tu contraseña actual" style="margin: 0; width: 100%; box-sizing: border-box; height: 42px;">
          </div>
          <div class="swal-input-group" style="display: flex; flex-direction: column; gap: 0.3rem;">
            <label style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Nueva Contraseña * (Mín. 8 caracteres)</label>
            <input id="swal-new-pass" type="password" class="swal2-input" placeholder="Nueva contraseña segura" style="margin: 0; width: 100%; box-sizing: border-box; height: 42px;">
          </div>
        </div>
      `,
      preConfirm: () => {
        const currentPass = (document.getElementById('swal-current-pass') as HTMLInputElement).value.trim();
        const newPass = (document.getElementById('swal-new-pass') as HTMLInputElement).value.trim();

        if (!currentPass || !newPass) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        if (newPass.length < 8) {
          Swal.showValidationMessage('La nueva contraseña debe tener al menos 8 caracteres');
          return false;
        }
        return { currentPass, newPass };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // Objeto preparado para ser procesado por tu endpoint PUT
        const payload = {
          telefono: this.perfil().telefono,
          password: result.value.newPass
          // Nota: Asegúrate de adaptar tu endpoint en Spring Boot si deseas validar la clave anterior de forma explícita.
        };

        this.http.put('http://localhost:8080/api/mi-perfil/actualizar', payload).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Actualizado!',
              text: 'Tu contraseña ha sido modificada con éxito.',
              icon: 'success',
              confirmButtonColor: '#0d9488'
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error || 'No se pudo actualizar la contraseña.',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  getIniciales(): string {
    const n = this.perfil().nombre ? this.perfil().nombre.trim().charAt(0).toUpperCase() : '';
    const a = this.perfil().apellido ? this.perfil().apellido.trim().charAt(0).toUpperCase() : '';
    return `${n}${a}` || 'DR';
  }

  getEspecialidadClase(): string {
    const esp = this.perfil().especialidad;
    return esp ? `badge-${esp.toLowerCase()}` : 'badge-general';
  }
}