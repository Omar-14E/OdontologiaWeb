import { Paciente } from './paciente';
import { Odontologo } from './odontologo';

export interface Cita {
  id?: number;
  fechaHora: string; // En Angular, las fechas suelen recibirse como string (ISO 8601) desde el backend
  estado: string; // 'PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'
  paciente: Paciente;
  odontologo: Odontologo;
}
