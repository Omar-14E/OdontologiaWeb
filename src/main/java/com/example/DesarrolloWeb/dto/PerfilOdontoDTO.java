package com.example.DesarrolloWeb.dto;
import com.example.DesarrolloWeb.enums.Especialidad; // 1. Importa tu enum aquí

public class PerfilOdontoDTO {
    private String nombre;
    private String apellido;
    private String telefono;
    private Especialidad especialidad;
    private String username;
    private String gmail;

    public PerfilOdontoDTO(String nombre, String apellido, String telefono, com.example.DesarrolloWeb.enums.Especialidad especialidad, String username, String gmail) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.especialidad = especialidad;
        this.username = username;
        this.gmail = gmail;
    }

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    
    public Especialidad getEspecialidad() { return especialidad; }
    public void setEspecialidad(Especialidad especialidad) { this.especialidad = especialidad; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getGmail() { return gmail; }
    public void setGmail(String gmail) { this.gmail = gmail; }
}
