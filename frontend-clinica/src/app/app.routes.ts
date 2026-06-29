import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CitasComponent } from './features/citas/citas';
import { LoginComponent } from './features/auth/login/login.component';
import { OdontoDashboardComponent } from './features/odonto-dashboard/odonto-dashboard';
import { OdontoAgendaComponent } from './features/odonto-agenda/odonto-agenda';

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
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];