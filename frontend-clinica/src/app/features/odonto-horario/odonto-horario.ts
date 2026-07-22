import { Component, OnInit, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

interface Turno {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

interface DiaSemana {
  nombre: string;
  fechaFormateada: string;
  turnos: Turno[];
}

@Component({
    selector: 'app-odonto-horario',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './odonto-horario.html', 
    styleUrls: ['./odonto-horario.scss']    
})
export class OdontoHorarioComponent implements OnInit {
    
    public diasSemana = signal<DiaSemana[]>([]);
    public cargando = signal<boolean>(true);

    private apiUrl = 'http://localhost:8080/api/mi-perfil/mis-turnos-semana';

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.cargarHorarioSemanal();
    }

    private cargarHorarioSemanal(): void {
        const token = localStorage.getItem('token'); 
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        this.http.get<Turno[]>(this.apiUrl, { headers }).subscribe({
            next: (turnosBack) => {
                this.armarEstructuraSemana(turnosBack);
                this.cargando.set(false);
            },
            error: (err) => {
                console.error("Error cargando los turnos del odontólogo", err);
                this.cargando.set(false);
            }
        });
    }

    private armarEstructuraSemana(turnos: Turno[]): void {
        const nombresDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const hoy = new Date();
        
        const numeroDiaActual = hoy.getDay(); 
        const diferenciaALunes = numeroDiaActual === 0 ? -6 : 1 - numeroDiaActual;
        const lunesActual = new Date(hoy);
        lunesActual.setDate(hoy.getDate() + diferenciaALunes);

        const estructura: DiaSemana[] = nombresDias.map((nombre, index) => {
            const fechaDia = new Date(lunesActual);
            fechaDia.setDate(lunesActual.getDate() + index);
            
            const yyyy = fechaDia.getFullYear();
            const mm = String(fechaDia.getMonth() + 1).padStart(2, '0');
            const dd = String(fechaDia.getDate()).padStart(2, '0');
            const fechaString = `${yyyy}-${mm}-${dd}`;

            return {
                nombre: nombre,
                fechaFormateada: `${dd}/${mm}`,
                fechaKey: fechaString,
                turnos: []
            };
        }) as any;

        turnos.forEach(turno => {
            const diaEncontrado = estructura.find((d: any) => d.fechaKey === turno.fecha);
            if (diaEncontrado) {
                turno.horaInicio = turno.horaInicio.substring(0, 5);
                turno.horaFin = turno.horaFin.substring(0, 5);
                diaEncontrado.turnos.push(turno);
            }
        });

        estructura.forEach(dia => {
            dia.turnos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        });

        this.diasSemana.set(estructura);
    }

    public getEstiloBloque(id: number): string {
        const estilos = ['bloque-azul', 'bloque-amarillo', 'bloque-rosa', 'bloque-naranja'];
        return estilos[id % estilos.length];
    }
}
