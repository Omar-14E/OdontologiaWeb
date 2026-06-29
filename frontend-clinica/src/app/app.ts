import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './features/navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend-clinica');
  protected readonly mostrarNavbar = signal<boolean>(false);
  
  private readonly router = inject(Router);

  ngOnInit(): void {
    // 1. EVALUACIÓN INICIAL: Revisa la ruta actual inmediatamente al cargar/renderizar
    this.evaluarRuta(this.router.url);

    // 2. EVALUACIÓN DINÁMICA: Escucha los cambios de ruta futuros (Navegaciones)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.evaluarRuta(event.urlAfterRedirects || event.url);
    });
  }

  /**
   * Método ayudante para verificar si la URL corresponde al login o no
   */
  private evaluarRuta(url: string) {
    // Convertimos a minúsculas para evitar fallos si la ruta es /Login o /LOGIN
    const urlMinuscula = url.toLowerCase();
    
    // Si la URL está vacía, es solo una barra '/' o incluye 'login', ocultamos el navbar
    if (urlMinuscula === '' || urlMinuscula === '/' || urlMinuscula.includes('login')) {
      this.mostrarNavbar.set(false);
    } else {
      this.mostrarNavbar.set(true);
    }
  }
}
