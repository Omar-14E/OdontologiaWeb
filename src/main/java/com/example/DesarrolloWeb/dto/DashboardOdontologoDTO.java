package com.example.DesarrolloWeb.dto;

import lombok.*;

@Getter
@Setter
public class DashboardOdontologoDTO {
    private String nombre;
    private String apellido;
    private long pacientesACargo; // De hoy
    private long citasDelDia;
    private long pacientesHistoricos; // 👈 NUEVO

    public DashboardOdontologoDTO(String nombre, String apellido, long pacientesACargo, long citasDelDia, long pacientesHistoricos) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.pacientesACargo = pacientesACargo;
        this.citasDelDia = citasDelDia;
        this.pacientesHistoricos = pacientesHistoricos; // 👈 NUEVO
    }
}
