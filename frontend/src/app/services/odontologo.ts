import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Odontologo } from '../models/odontologo'; // Apunta a tu interfaz

@Injectable({
  providedIn: 'root'
})
export class OdontologoService {
  private apiUrl = 'http://localhost:8080/api/odontologos';

  constructor(private http: HttpClient) { }

  getOdontologos(): Observable<Odontologo[]> {
    return this.http.get<Odontologo[]>(this.apiUrl);
  }

  deleteOdontologo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }

  createOdontologo(odontologo: Odontologo): Observable<Odontologo> {
    return this.http.post<Odontologo>(`${this.apiUrl}/registrar`, odontologo);
  }
}
