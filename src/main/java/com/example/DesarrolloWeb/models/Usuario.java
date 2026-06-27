package com.example.DesarrolloWeb.models;

import com.example.DesarrolloWeb.enums.Rol;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty; // <- Import nuevo agregado
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres para ser segura")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // <- Esta es la magia para la seguridad
    private String password;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Debe ingresar un correo electrónico válido")
    private String gmail;

    @NotNull(message = "Debe asignar un rol al usuario")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol; // aca va paciente, odontologo o administrador que ya esta predeterminado en enum Rol
}