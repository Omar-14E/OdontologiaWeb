import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CitasComponent } from './features/citas/citas';
import { LoginComponent } from './features/auth/login/login.component';
import { OdontoDashboardComponent } from './features/odonto-dashboard/odonto-dashboard';
import { OdontoAgendaComponent } from './features/odonto-agenda/odonto-agenda';
import { OdontoPacientesComponent } from './features/odonto-pacientes/odonto-pacientes';

// Importamos los nuevos componentes del administrador
import { AdminMedicosComponent } from './features/admin-medicos/admin-medicos';
import { AdminPacientesComponent } from './features/admin-pacientes/admin-pacientes';

import { AdminTurnosComponent } from './features/admin-turnos/admin-turnos';

export const routes: Routes = [
  // Dejamos las rutas libres por ahora para probar la UI

  {
    path: 'login',
    component: LoginComponent
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent 
  },
  {
    path: 'odonDashboard',
    component: OdontoDashboardComponent
  },
  { 
    path: 'citas', 
    component: CitasComponent 
  },
  {
    path: 'odonAgenda',
    component: OdontoAgendaComponent
  },
  {
    path: 'odonPacientes',
    component: OdontoPacientesComponent
  },
  
  // --- Nuevas rutas del Administrador ---
  {
    path: 'admin-medicos',
    component: AdminMedicosComponent
  },
  {
    path: 'admin-pacientes',
    component: AdminPacientesComponent
  },

  {
    path: 'admin-turnos',
    component: AdminTurnosComponent
  },

  // Las redirecciones por defecto y el comodín siempre deben ir al final
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];