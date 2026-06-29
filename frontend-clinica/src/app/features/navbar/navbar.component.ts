import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  // Signals reactivas para el estado de la UI
  usuarioRol = signal<string | null>(null);
  usuarioNombre = signal<string | null>(null);
  menuAbierto = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Recuperamos el rol y el nombre guardados en el login
    this.usuarioRol.set(this.authService.getRol());
    this.usuarioNombre.set(localStorage.getItem('username'));
  }

  // Alterna la visibilidad del menú desplegable (los 3 puntitos / perfil)
  toggleMenu() {
    this.menuAbierto.update(estado => !estado);
  }

  ejecutarLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}