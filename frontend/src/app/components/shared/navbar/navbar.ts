import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  // Creamos una variable normal en lugar de un 'get'
  usuarioRol: string | null = null;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Solo leemos el rol si estamos en el navegador, para no romper el Servidor (SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.usuarioRol = this.authService.rol;
    }
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
