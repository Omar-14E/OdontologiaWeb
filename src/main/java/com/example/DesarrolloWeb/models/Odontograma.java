package com.example.DesarrolloWeb.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
public class Odontograma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // VALIDACIÓN: En la nomenclatura dental FDI (la más usada),
    // los dientes permanentes van del 11 al 48, y los temporales del 51 al 85.
    @NotNull(message = "El número de diente es obligatorio")
    @Min(value = 11, message = "El número de diente mínimo es 11")
    @Max(value = 85, message = "El número de diente máximo es 85")
    private Integer numeroDiente;

    @NotNull(message = "Debe tener un estado")
    private String estado;


    @NotNull(message = "El registro debe pertenecer a un paciente")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;
}