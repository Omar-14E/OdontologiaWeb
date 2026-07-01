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
    templateUrl: './odonto-horario.html', // 👈 Cambia esto si tu archivo tiene ".component"
    styleUrls: ['./odonto-horario.scss']    // 👈 Revisa si tu CSS también lo necesita
})
export class OdontoHorarioComponent implements OnInit {
    
    // Usamos Signals para reactividad óptima y limpia
    public diasSemana = signal<DiaSemana[]>([]);
    public cargando = signal<boolean>(true);

    private apiUrl = 'http://localhost:8080/api/mi-perfil/mis-turnos-semana';

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.cargarHorarioSemanal();
    }

    private cargarHorarioSemanal(): void {
        // Obtenemos el token JWT guardado en tu sistema de sesión
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
        
        // Calcular el lunes de la semana actual
        const numeroDiaActual = hoy.getDay(); 
        const diferenciaALunes = numeroDiaActual === 0 ? -6 : 1 - numeroDiaActual;
        const lunesActual = new Date(hoy);
        lunesActual.setDate(hoy.getDate() + diferenciaALunes);

        // Inicializar estructura limpia de Lunes a Sábado
        const estructura: DiaSemana[] = nombresDias.map((nombre, index) => {
            const fechaDia = new Date(lunesActual);
            fechaDia.setDate(lunesActual.getDate() + index);
            
            // Formato ISO local YYYY-MM-DD para emparejar con el backend
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

        // Clasificar cada turno en su respectivo contenedor de día
        turnos.forEach(turno => {
            const diaEncontrado = estructura.find((d: any) => d.fechaKey === turno.fecha);
            if (diaEncontrado) {
                // Formatear las horas (quitar segundos si vienen del backend hh:mm:ss -> hh:mm)
                turno.horaInicio = turno.horaInicio.substring(0, 5);
                turno.horaFin = turno.horaFin.substring(0, 5);
                diaEncontrado.turnos.push(turno);
            }
        });

        // Ordenar los turnos de cada día de forma cronológica por hora de inicio
        estructura.forEach(dia => {
            dia.turnos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        });

        this.diasSemana.set(estructura);
    }

    // Retorna una paleta suave de colores aleatoria/fija según el ID del bloque
    public getEstiloBloque(id: number): string {
        const estilos = ['bloque-azul', 'bloque-amarillo', 'bloque-rosa', 'bloque-naranja'];
        return estilos[id % estilos.length];
    }
}
