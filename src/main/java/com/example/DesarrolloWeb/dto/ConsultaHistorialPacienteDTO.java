package com.example.DesarrolloWeb.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ConsultaHistorialPacienteDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private String especialidad; 
    private String observaciones; 
    private String estado;
}