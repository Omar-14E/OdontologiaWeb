import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita'; // Asegúrate de que la ruta sea correcta
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
      @Inject(PLATFORM_ID) private platformId: Object,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarCitas();
    }
  }

  cargarCitas() {
    this.citaService.getCitas().subscribe({
          // 👇 Le decimos explícitamente que 'datos' es un arreglo de Cita
          next: (datos: Cita[]) => {
            this.citas = datos;
            this.cdr.detectChanges();
          },
          // 👇 Le decimos explícitamente que 'err' puede ser cualquier cosa (any)
          error: (err: any) => {
            console.error('Error al cargar citas:', err);
          }
        });
  }

  eliminar(id: number) {
    if(confirm('¿Estás seguro de eliminar esta cita?')) {
      this.citaService.deleteCita(id).subscribe(() => {
        this.cargarCitas(); // Recargamos la lista tras eliminar
      });
    }
  }

  editar(id: number) {
    this.router.navigate(['/citas/editar', id]);
  }
}
