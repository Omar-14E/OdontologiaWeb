package com.example.DesarrolloWeb.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;

    @OneToOne
    private Usuario usuario;
}