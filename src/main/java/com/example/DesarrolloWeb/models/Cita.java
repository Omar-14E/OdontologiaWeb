package com.example.DesarrolloWeb.models;

import com.example.DesarrolloWeb.enums.EstadoCita;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La fecha y hora de la cita son obligatorias")
    //@FutureOrPresent(message = "No puedes programar una cita en el pasado")
    private LocalDateTime fechaHora;

    @NotNull(message = "El estado de la cita es obligatorio")
    @Enumerated(EnumType.STRING)
    private EstadoCita estado;

    @NotNull(message = "La cita debe tener un paciente asignado")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @NotNull(message = "La cita debe tener un odontólogo asignado")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "odontologo_id")
    private Odontologo odontologo;

    // Agrega esto dentro de tu clase Cita:

    @Column(name = "observaciones", columnDefinition = "TEXT") 
    private String observaciones;
}