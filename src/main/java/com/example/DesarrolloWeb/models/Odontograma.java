package com.example.DesarrolloWeb.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Odontograma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer numeroDiente;
    private String estado;

    @ManyToOne
    private Paciente paciente;
}