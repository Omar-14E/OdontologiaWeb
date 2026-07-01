import { Component, OnInit, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../auth/services/auth.service";

@Component({
    selector: 'app-odonto-horario',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './odonto-horario.html',
    styleUrls: ['./odonto-horario.css']
})
export class OdontoHorarioComponent implements OnInit{


}
