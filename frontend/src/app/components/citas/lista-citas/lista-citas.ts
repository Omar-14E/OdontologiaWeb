import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita';
import { Cita } from '../../../models/cita';

@Component({
  selector: 'app-lista-citas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-citas.html', // Sin .component
  styleUrl: './lista-citas.css'      // Sin .component
})
export class ListaCitasComponent implements OnInit {
  // ... resto del código igual que el que te pasé ...
  citas: Cita[] = [];

  constructor(private citaService: CitaService, private router: Router) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas() {
    this.citaService.getCitas().subscribe(datos => this.citas = datos);
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
