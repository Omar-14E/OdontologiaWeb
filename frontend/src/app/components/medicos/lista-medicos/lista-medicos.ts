import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Importamos el Router de Angular
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
export class ListaMedicos implements OnInit {
  medicos: Odontologo[] = [];

  // 2. Inyectamos el Router aquí en el constructor, junto a tu servicio
  constructor(
    private odontologoService: OdontologoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos() {
    this.odontologoService.getOdontologos().subscribe(datos => {
      this.medicos = datos;
    });
  }

  eliminar(id: number) {
    if(confirm('¿Estás seguro de eliminar este médico?')) {
      this.odontologoService.deleteOdontologo(id).subscribe(() => {
        this.cargarMedicos();
      });
    }
  }

  // 3. Este es el método infalible que obligará a Angular a cambiar de ruta
  irNuevoMedico() {
    this.router.navigate(['/medicos/nuevo']);
  }
}
