import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDTO } from '../models/dashboard'; // Apunta a tu interfaz del dashboard

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // La URL del endpoint que creamos en Spring Boot
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  // Método para traer las métricas (totales) desde el backend
  getTotales(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(this.apiUrl);
  }
}
