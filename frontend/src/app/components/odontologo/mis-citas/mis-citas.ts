import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OdontologoService } from '../../../services/odontologo'; // <-- Ruta corregida (3 niveles)

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css'
})
export class MisCitasComponent implements OnInit {
  citas: any[] = [];
  cargando: boolean = true;

  constructor(private odontologoService: OdontologoService) {}

  ngOnInit(): void {
    this.odontologoService.getMisCitas().subscribe({
      next: (data: any) => { // <-- Se agregó : any
        this.citas = data;
        this.cargando = false;
      },
      error: (err: any) => { // <-- Se agregó : any
        console.error('Error al cargar citas', err);
        this.cargando = false;
      }
    });
  }
}
