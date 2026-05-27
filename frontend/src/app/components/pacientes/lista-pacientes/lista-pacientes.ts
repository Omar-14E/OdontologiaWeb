import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PacienteService } from '../../../services/paciente';
import { Paciente } from '../../../models/paciente';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-pacientes.html',
  styleUrl: './lista-pacientes.css'
})
export class ListaPacientesComponent implements OnInit {
  pacientes: Paciente[] = [];

  constructor(
      private pacienteService: PacienteService,
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: Object,
      private cdr: ChangeDetectorRef // <-- Para forzar el dibujado
  ) {}

  ngOnInit(): void {
    // 1. Bloqueamos al servidor para que no haga peticiones fallidas sin token
    if (isPlatformBrowser(this.platformId)) {
      this.cargarPacientes();
    }
  }

  cargarPacientes() {
    this.pacienteService.getPacientes().subscribe({
      next: (datos) => {
        this.pacientes = datos;

        // 2. Obligamos a Angular a mostrar la tabla SIN NECESIDAD de hacer clics
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
      }
    });
  }

  eliminar(id: number) {
    if(confirm('¿Estás seguro de eliminar este paciente?')) {
      this.pacienteService.deletePaciente(id).subscribe(() => {
        this.cargarPacientes();
      });
    }
  }

  editar(id: number) {
    this.router.navigate(['/pacientes/editar', id]);
  }
}
