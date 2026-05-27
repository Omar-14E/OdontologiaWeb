package com.example.DesarrolloWeb.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Odontograma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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