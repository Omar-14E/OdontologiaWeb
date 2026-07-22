package com.example.DesarrolloWeb.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "El nombre solo puede contener letras")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "El apellido solo puede contener letras")
    private String apellido;

    @NotBlank(message = "El N° de DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{8}$", message = "El DNI debe contar con 8 dígitos")
    private String dni;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^9[0-9]{8}$", message = "El teléfono debe tener 9 dígitos y empezar con el número 9")
    private String telefono;

    @Column(nullable = false)
    private boolean activo = true;

    @OneToOne
    private Usuario usuario;

    @JsonIgnore
    @OneToMany(mappedBy = "paciente")
    private List<Cita> citas;

    @JsonIgnore
    @OneToMany(mappedBy = "paciente")
    private List<Odontograma> odontogramas;
}