import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  let token = null;

  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
    // 👇 ESTO ES LO NUEVO: Nos dirá si Angular está encontrando el token
    console.log('🔍 Interceptor: ¿Hay token en localStorage?', token ? 'SÍ' : 'NO (está vacío)');
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
