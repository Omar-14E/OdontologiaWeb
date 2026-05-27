package com.example.DesarrolloWeb.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardDTO {
    private long totalPacientes;
    private long totalOdontologos;
    private long totalCitas;
    private long citasDelDia;

    public DashboardDTO(long totalPacientes, long totalOdontologos, long totalCitas, long citasDelDia) {
        this.totalPacientes = totalPacientes;
        this.totalOdontologos = totalOdontologos;
        this.totalCitas = totalCitas;
        this.citasDelDia = citasDelDia;
    }
}