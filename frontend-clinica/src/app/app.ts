import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './features/navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend-clinica');
  protected readonly mostrarNavbar = signal<boolean>(false);
  
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.evaluarRuta(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.evaluarRuta(event.urlAfterRedirects || event.url);
    });
  }

  private evaluarRuta(url: string) {
    const urlMinuscula = url.toLowerCase();
    
    if (urlMinuscula === '' || urlMinuscula === '/' || urlMinuscula.includes('login')) {
      this.mostrarNavbar.set(false);
    } else {
      this.mostrarNavbar.set(true);
    }
  }
}
