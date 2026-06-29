package com.example.DesarrolloWeb.dto;

import lombok.*;

@Getter
@Setter
public class DashboardOdontologoDTO {
    private String nombre;
    private String apellido;
    private long pacientesACargo;
    private long citasDelDia;

    public DashboardOdontologoDTO(String nombre, String apellido, long pacientesACargo, long citasDelDia) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.pacientesACargo = pacientesACargo;
        this.citasDelDia = citasDelDia;
    }
}
