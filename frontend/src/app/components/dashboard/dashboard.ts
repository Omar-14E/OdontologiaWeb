import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { OdontologoService } from '../../services/odontologo'; // Importamos el servicio

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  rol: string = '';
  username: string = '';

  totalCitas: number = 0;
  totalPacientes: number = 0;

  constructor(
    private authService: AuthService,
    private odontologoService: OdontologoService // Inyectamos el servicio
  ) {}

  ngOnInit(): void {
    this.rol = this.authService.rol;
    this.username = localStorage.getItem('username') || 'Usuario';

    if (this.rol === 'ODONTOLOGO') {
      this.cargarMetricasOdontologo();
    }
  }

  cargarMetricasOdontologo() {
    this.odontologoService.getMisCitas().subscribe({
      next: (data: any) => this.totalCitas = data.length
    });

    this.odontologoService.getMisPacientes().subscribe({
      next: (data: any) => this.totalPacientes = data.length
    });
  }
}
