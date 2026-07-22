import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';
  
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(credenciales: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credenciales).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('username', res.username);
        this.loggedIn.next(true);
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.loggedIn.next(false);
  }

  getToken(): string | null { return localStorage.getItem('token'); }
  getRol(): string | null { return localStorage.getItem('rol'); }
  isLoggedIn(): Observable<boolean> { return this.loggedIn.asObservable(); }
  private hasToken(): boolean { return !!localStorage.getItem('token'); }
}