import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CitasComponent } from './features/citas/citas';
import { LoginComponent } from './features/auth/login/login.component';
import { OdontoDashboardComponent } from './features/odonto-dashboard/odonto-dashboard';
import { OdontoAgendaComponent } from './features/odonto-agenda/odonto-agenda';
import { OdontoPacientesComponent } from './features/odonto-pacientes/odonto-pacientes';
import { OdontoPerfilComponent } from './features/odonto-perfil/odonto-perfil';

// Importamos los nuevos componentes del administrador
import { AdminMedicosComponent } from './features/admin-medicos/admin-medicos';
import { AdminPacientesComponent } from './features/admin-pacientes/admin-pacientes';
import { AdminTurnosComponent } from './features/admin-turnos/admin-turnos';
import { AdminHistorialCitasComponent } from './features/admin-historial-citas/admin-historial-citas';

export const routes: Routes = [
  
  // --- RUTA PÚBLICA / INVERSA ---
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard] // 👈 Si ya hay sesión activa, bloquea el acceso al login y lo redirige a su panel
  },

  // --- RUTAS PROTEGIDAS (Requieren Token) ---
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  {
    path: 'odonDashboard',
    component: OdontoDashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'citas', 
    component: CitasComponent,
    canActivate: [authGuard]
  },
  {
    path: 'odonAgenda',
    component: OdontoAgendaComponent,
    canActivate: [authGuard]
  },
  {
    path: 'odonPacientes',
    component: OdontoPacientesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'odonPerfil',
    component: OdontoPerfilComponent,
    canActivate: [authGuard]

  },
  
  // --- Nuevas rutas del Administrador (Protegidas) ---
  {
    path: 'admin-medicos',
    component: AdminMedicosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin-pacientes',
    component: AdminPacientesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin-turnos',
    component: AdminTurnosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin-historial-citas',
    component: AdminHistorialCitasComponent,
    canActivate: [authGuard]
  },

  // Las redirecciones por defecto y el comodín siempre deben ir al final
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];