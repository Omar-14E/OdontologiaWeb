import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { ListaMedicos } from './components/medicos/lista-medicos/lista-medicos';
import { FormMedico } from './components/medicos/form-medico/form-medico';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'medicos', component: ListaMedicos },
  { path: 'medicos/nuevo', component: FormMedico }
];
