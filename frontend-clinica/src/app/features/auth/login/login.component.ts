import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent{
    loginForm: FormGroup;
    errorMessage: string='';

    constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
    ){
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void{
        if(this.loginForm.invalid){
            this.loginForm.markAllAsTouched();
            return;
        }

        const credenciales = this.loginForm.value;

        this.authService.login(credenciales).subscribe({
            next: (res) => {
                    console.log('Login exitoso, datos guardados por el servicio:', res);
                    
                    const rolUsuario = res.rol; 

                    if (rolUsuario === 'ADMIN') {
                        this.router.navigate(['/dashboard']); //REVISA ESTO NOEEE ESTA NO ES LA RUTA DEBES PONER LA RUTA EXACTA
                    } else if (rolUsuario === 'ODONTOLOGO') {
                        this.router.navigate(['/odonDashboard']); //REVISA ESTO NOEEE ESTA NO ES LA RUTA DEBES PONER LA RUTA EXACTA
                    } else {
                        // Una ruta por defecto por si tienes pacientes u otros roles
                        this.router.navigate(['/home']); 
                    }
            },
            
            error: (err) => {
                    // Manejo de errores si el backend responde con un fallo (401, 403, etc.)
                    this.errorMessage = 'Usuario o contraseña incorrectos. Inténtalo de nuevo.';
                    console.error(err);
                }
        });


    }
}

