import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

import { DashboardComponent } from './components/dashboard/dashboard';
import { ListaMedicosComponent } from './components/medicos/lista-medicos/lista-medicos';
import { FormMedicoComponent } from './components/medicos/form-medico/form-medico';
import { ListaPacientesComponent } from './components/pacientes/lista-pacientes/lista-pacientes';
import { FormPacienteComponent } from './components/pacientes/form-paciente/form-paciente';
import { ListaCitasComponent } from './components/citas/lista-citas/lista-citas';
import { FormCitaComponent } from './components/citas/form-cita/form-cita';
import { LoginComponent } from './components/auth/login/login';
import { MisCitasComponent } from './components/odontologo/mis-citas/mis-citas';
import { MisPacientesComponent } from './components/odontologo/mis-pacientes/mis-pacientes';

export const routes: Routes = [
  // El login es la única ruta pública
  { path: 'login', component: LoginComponent },

  // Todas las demás rutas llevan el vigilante (canActivate)
  { path: '', component: DashboardComponent, canActivate: [authGuard] },

  // Rutas de Médicos
  { path: 'medicos', component: ListaMedicosComponent, canActivate: [authGuard] },
  { path: 'medicos/nuevo', component: FormMedicoComponent, canActivate: [authGuard] },
  { path: 'medicos/editar/:id', component: FormMedicoComponent, canActivate: [authGuard] },

  // Rutas de Pacientes
  { path: 'pacientes', component: ListaPacientesComponent, canActivate: [authGuard] },
  { path: 'pacientes/nuevo', component: FormPacienteComponent, canActivate: [authGuard] },
  { path: 'pacientes/editar/:id', component: FormPacienteComponent, canActivate: [authGuard] },

  // Rutas de Citas
  { path: 'citas', component: ListaCitasComponent, canActivate: [authGuard] },
  { path: 'citas/nueva', component: FormCitaComponent, canActivate: [authGuard] },
  { path: 'citas/editar/:id', component: FormCitaComponent, canActivate: [authGuard] },

  { path: 'mis-citas', component: MisCitasComponent, canActivate: [authGuard] },
  { path: 'mis-pacientes', component: MisPacientesComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];
