import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrlOdontologos = 'http://localhost:8080/api/odontologos';
  private apiUrlPacientes = 'http://localhost:8080/api/pacientes';
  private apiUrlTurnos = 'http://localhost:8080/api/turnos';
  private apiUrlCitas = 'http://localhost:8080/api/citas';

  constructor(private http: HttpClient) {}

  getOdontologos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlOdontologos);
  }

  crearOdontologo(odontologo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlOdontologos}/registrar`, odontologo);
  }

  actualizarOdontologo(id: number, odontologo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrlOdontologos}/actualizar/${id}`, odontologo);
  }

  cambiarEstadoOdontologo(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrlOdontologos}/cambiar-estado/${id}`, {});
  }

  getPacientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlPacientes);
  }

  crearPaciente(paciente: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlPacientes}/registrar`, paciente);
  }

  actualizarPaciente(id: number, paciente: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrlPacientes}/actualizar/${id}`, paciente);
  }

  cambiarEstadoPaciente(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrlPacientes}/cambiar-estado/${id}`, {});
  }

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

  crearCita(cita: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlCitas}/registrar`, cita);
  }


  actualizarCita(id: number, cita: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrlCitas}/actualizar/${id}`, cita);
  }

  eliminarCita(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlCitas}/eliminar/${id}`);
  }

  getDisponibilidad(odontologoId: number, fecha: string): Observable<string[]> {
    const params = new HttpParams()
      .set('odontologoId', odontologoId.toString())
      .set('fecha', fecha);

    return this.http.get<string[]>(`${this.apiUrlCitas}/disponibilidad`, { params });
  }
}
