package com.example.DesarrolloWeb.dto;

import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.Paciente;
import java.util.List;
import lombok.*;

@Getter
@Setter
public class AgendaOdontoDTO {
    private List<Cita> citasDeHoy;
    private List<Paciente> pacientesDeHoy;
    private List<Cita> citasDeLaSemana;

    public AgendaOdontoDTO(List<Cita> citasDeHoy, List<Paciente> pacientesDeHoy, List<Cita> citasDeLaSemana) {
        this.citasDeHoy = citasDeHoy;
        this.pacientesDeHoy = pacientesDeHoy;
        this.citasDeLaSemana = citasDeLaSemana;
    }
}
