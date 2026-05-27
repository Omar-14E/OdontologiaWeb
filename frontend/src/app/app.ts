import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/shared/navbar/navbar'; // Nombre corto

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar], // Nombre corto
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { } // Nombre original que espera Angular
