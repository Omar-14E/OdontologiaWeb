import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    // Inyectamos el ID de la plataforma para saber si estamos en el servidor o navegador
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(res => {
        // Solo guardamos si estamos en el navegador
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('rol', res.rol);
          localStorage.setItem('username', res.username);
        }
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      window.location.reload();
    }
  }

  get token() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  get rol() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('rol') || '';
    }
    return '';
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
}
