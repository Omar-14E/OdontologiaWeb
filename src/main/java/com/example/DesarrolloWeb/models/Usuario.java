package com.example.DesarrolloWeb.models;

import com.example.DesarrolloWeb.enums.Rol;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Debe ingresar un correo electrónico válido")
    private String gmail;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres para ser segura")
    private String password;

    @NotNull(message = "Debe asignar un rol al usuario")
    @Enumerated(EnumType.STRING)
    private Rol rol; // aca va paciente, odontologo o administrador que ya esta predeterminado en enum Rol
}