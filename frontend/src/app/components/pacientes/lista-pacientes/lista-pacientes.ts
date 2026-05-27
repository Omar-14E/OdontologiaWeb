import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PacienteService } from '../../../services/paciente';
import { Paciente } from '../../../models/paciente';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-pacientes.html', // Sin .component
  styleUrl: './lista-pacientes.css'      // Sin .component
})
export class ListaPacientesComponent implements OnInit {
  // ... resto del código igual que el que te pasé en el mensaje anterior ...
  pacientes: Paciente[] = [];

  constructor(private pacienteService: PacienteService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.pacienteService.getPacientes().subscribe(datos => this.pacientes = datos);
  }

  eliminar(id: number) {
    if(confirm('¿Estás seguro de eliminar este paciente?')) {
      this.pacienteService.deletePaciente(id).subscribe(() => this.cargarPacientes());
    }
  }

  editar(id: number) {
    this.router.navigate(['/pacientes/editar', id]);
  }
}
