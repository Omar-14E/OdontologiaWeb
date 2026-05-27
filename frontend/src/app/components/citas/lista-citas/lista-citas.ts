import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core'; // <-- Importamos las herramientas
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- isPlatformBrowser
import { Router, RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita';
import { Cita } from '../../../models/cita';

@Component({
  selector: 'app-lista-citas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-citas.html',
  styleUrl: './lista-citas.css'
})
export class ListaCitasComponent implements OnInit {
  citas: Cita[] = [];

  constructor(
    private citaService: CitaService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object, // <-- Inyectamos plataforma
    private cdr: ChangeDetectorRef                   // <-- Inyectamos el detector
  ) {}

  ngOnInit(): void {
    // 1. Bloqueamos al servidor (SSR) para que no haga la petición sin token
    if (isPlatformBrowser(this.platformId)) {
      this.cargarCitas();
    }
  }

  cargarCitas() {
    this.citaService.getCitas().subscribe({
      next: (datos) => {
        this.citas = datos;

        // 2. Obligamos a Angular a dibujar la tabla instantáneamente
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las citas:', err);
      }
    });
  }

  eliminar(id: number) {
    if(confirm('¿Cancelar esta cita?')) {
      this.citaService.deleteCita(id).subscribe(() => this.cargarCitas());
    }
  }

  editar(id: number) {
    this.router.navigate(['/citas/editar', id]);
  }
}
