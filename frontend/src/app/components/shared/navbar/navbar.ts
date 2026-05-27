import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {

  constructor(private authService: AuthService) {}

  // Lee el rol real directamente del localStorage a través del servicio
  get usuarioRol(): string {
    return this.authService.rol;
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
