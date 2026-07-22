import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  usuarioRol = signal<string | null>(null);
  usuarioNombre = signal<string | null>(null);
  menuAbierto = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.usuarioRol.set(this.authService.getRol());
    this.usuarioNombre.set(localStorage.getItem('username'));
  }

  toggleMenu() {
    this.menuAbierto.update(estado => !estado);
  }

  ejecutarLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}