package com.example.DesarrolloWeb.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime fechaHora;
    private String estado; // "PENDIENTE", "ATENDIDA"

    @ManyToOne
    private Paciente paciente;

    @ManyToOne
    private Usuario odontologo;
}