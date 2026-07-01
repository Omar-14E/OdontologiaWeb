import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario YA tiene un token (ya inició sesión)
  if (authService.getToken()) {
    
    // Lo ideal es leer el rol desde el localStorage o el AuthService
    // Asumo que al iniciar sesión guardas el rol en el LocalStorage
    const rol = localStorage.getItem('rol'); 

    // Lo redirigimos a donde pertenece para que no vea el Login
    if (rol === 'ADMIN') {
      router.navigate(['/dashboard']);
    } else if (rol === 'ODONTOLOGO') {
      router.navigate(['/odonDashboard']);
    } else {
      router.navigate(['/dashboard']); // Redirección por defecto
    }

    return false; // BLOQUEA el acceso a la ruta del login
  } 

  return true; 
};