import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Odontologo } from '../models/odontologo';

@Injectable({
  providedIn: 'root'
})
export class OdontologoService {
  private apiUrl = 'http://localhost:8080/api/odontologos';

  constructor(private http: HttpClient) { }

  getOdontologos(): Observable<Odontologo[]> {
    return this.http.get<Odontologo[]>(this.apiUrl);
  }

  getOdontologoById(id: number): Observable<Odontologo> {
    return this.http.get<Odontologo>(`${this.apiUrl}/${id}`);
  }

  createOdontologo(odontologo: Odontologo): Observable<Odontologo> {
    return this.http.post<Odontologo>(`${this.apiUrl}/registrar`, odontologo);
  }

  updateOdontologo(id: number, odontologo: Odontologo): Observable<Odontologo> {
    return this.http.put<Odontologo>(`${this.apiUrl}/actualizar/${id}`, odontologo);
  }

  deleteOdontologo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }

  getMisCitas(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/citas`);
    }

  getMisPacientes(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/pacientes`);
  }
}
