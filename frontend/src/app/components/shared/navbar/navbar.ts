import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Vital para que funcionen los menús

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar { } // Exportamos como 'Navbar'
