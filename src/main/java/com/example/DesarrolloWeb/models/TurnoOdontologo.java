package com.example.DesarrolloWeb.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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