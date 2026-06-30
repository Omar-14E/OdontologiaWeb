import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrlOdontologos = 'http://localhost:8080/api/odontologos';
  private apiUrlPacientes = 'http://localhost:8080/api/pacientes';
  private apiUrlTurnos = 'http://localhost:8080/api/turnos';
  private apiUrlCitas = 'http://localhost:8080/api/citas';

  constructor(private http: HttpClient) {}

  // --- CRUD Odontólogos ---
  getOdontologos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlOdontologos);
  }

  crearOdontologo(odontologo: any): Observable<any> {
    // Agregado /registrar
    return this.http.post<any>(`${this.apiUrlOdontologos}/registrar`, odontologo); 
  }

  actualizarOdontologo(id: number, odontologo: any): Observable<any> {
    // Agregado /actualizar/
    return this.http.put<any>(`${this.apiUrlOdontologos}/actualizar/${id}`, odontologo);
  }

  eliminarOdontologo(id: number): Observable<any> {
    // Agregado /eliminar/
    return this.http.delete<any>(`${this.apiUrlOdontologos}/eliminar/${id}`);
  }

  // --- CRUD Pacientes ---
  getPacientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlPacientes);
  }

  crearPaciente(paciente: any): Observable<any> {
    // Agregado /registrar
    return this.http.post<any>(`${this.apiUrlPacientes}/registrar`, paciente);
  }

  actualizarPaciente(id: number, paciente: any): Observable<any> {
    // Agregado /actualizar/
    return this.http.put<any>(`${this.apiUrlPacientes}/actualizar/${id}`, paciente);
  }

  eliminarPaciente(id: number): Observable<any> {
    // Agregado /eliminar/
    return this.http.delete<any>(`${this.apiUrlPacientes}/eliminar/${id}`);
  }

  // --- CRUD Turnos / Horarios ---
  getTurnosVigentes(odontologoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlTurnos}/vigentes/${odontologoId}`);
  }

  asignarTurno(odontologoId: number, turno: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlTurnos}/asignar/${odontologoId}`, turno);
  }

  moverTurno(turnoId: number, turno: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrlTurnos}/mover/${turnoId}`, turno);
  }

  eliminarTurno(turnoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlTurnos}/eliminar/${turnoId}`);
  }

  // HISTORIAL DE CITAS :D
  getHistorialCitas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlCitas);
  }
}