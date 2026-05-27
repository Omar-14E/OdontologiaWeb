package com.example.DesarrolloWeb.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Locale;

@Entity
@Data
public class TurnoOdontologo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "No puedes registrar un turno en una fecha pasada")
    private LocalDate fecha;

    @NotNull(message = "La hora de Inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;

    @NotNull(message = "El turno debe tener un odontólogo asignado")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Odontologo_id")
    private Odontologo odontologo;
}

