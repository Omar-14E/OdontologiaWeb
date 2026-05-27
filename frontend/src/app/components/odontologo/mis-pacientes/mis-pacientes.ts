import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OdontologoService } from '../../../services/odontologo'; // <-- Ruta corregida (3 niveles)

@Component({
  selector: 'app-mis-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-pacientes.html',
  styleUrl: './mis-pacientes.css'
})
export class MisPacientesComponent implements OnInit {
  pacientes: any[] = [];
  cargando: boolean = true;

  constructor(private odontologoService: OdontologoService) {}

  ngOnInit(): void {
    this.odontologoService.getMisPacientes().subscribe({
      next: (data: any) => { // <-- Se agregó : any
        this.pacientes = data;
        this.cargando = false;
      },
      error: (err: any) => { // <-- Se agregó : any
        console.error('Error al cargar pacientes', err);
        this.cargando = false;
      }
    });
  }
}
