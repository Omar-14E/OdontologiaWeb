import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CitasComponent } from './features/citas/citas';

export const routes: Routes = [
  // Dejamos las rutas libres por ahora para probar la UI
  { 
    path: 'dashboard', 
    component: DashboardComponent 
  },
  { 
    path: 'citas', 
    component: CitasComponent 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];