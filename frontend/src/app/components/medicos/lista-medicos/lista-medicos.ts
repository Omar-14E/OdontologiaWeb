import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core'; // <-- 1. Nuevas importaciones
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- 2. Importamos isPlatformBrowser
import { Router } from '@angular/router';
import { OdontologoService } from '../../../services/odontologo';
import { Odontologo } from '../../../models/odontologo';

@Component({
  selector: 'app-lista-medicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-medicos.html',
  styleUrl: './lista-medicos.css'
})
export class ListaMedicosComponent implements OnInit {
  medicos: Odontologo[] = [];

  constructor(
    private odontologoService: OdontologoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object, // <-- 3. Inyectamos la plataforma
    private cdr: ChangeDetectorRef                   // <-- 4. Inyectamos el detector de cambios
  ) {}

  ngOnInit(): void {
    // Bloqueamos al servidor para que esto solo se ejecute en el navegador del usuario
    if (isPlatformBrowser(this.platformId)) {
      this.cargarMedicos();
    }
  }

  cargarMedicos() {
    this.odontologoService.getOdontologos().subscribe({
      next: (datos) => {
        this.medicos = datos;

        // ¡LA MAGIA! Forzamos a Angular a mostrar la tabla SIN NECESIDAD del doble clic
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar médicos:', err);
      }
    });
  }

  editar(id: number) {
      this.router.navigate(['/medicos/editar', id]);
  }

  eliminar(id: number) {
    if(confirm('¿Estás seguro de eliminar este médico?')) {
      this.odontologoService.deleteOdontologo(id).subscribe(() => {
        this.cargarMedicos();
      });
    }
  }

  irNuevoMedico() {
    this.router.navigate(['/medicos/nuevo']);
  }
}
