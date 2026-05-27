package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.dto.DashboardDTO;
import com.example.DesarrolloWeb.repository.CitaRepository;
import com.example.DesarrolloWeb.repository.OdontologoRepository;
import com.example.DesarrolloWeb.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private OdontologoRepository odontologoRepository;

    @Autowired
    private CitaRepository citaRepository;

    @GetMapping
    public ResponseEntity<DashboardDTO> obtenerDatosDashboard() {
        // Obtenemos los totales gracias a los métodos que ya incluye JPA
        long totalPacientes = pacienteRepository.count();
        long totalOdontologos = odontologoRepository.count();
        long totalCitas = citaRepository.count();

        // Usamos la consulta JPQL que creamos en el Paso 1
        long citasDelDia = citaRepository.contarCitasDelDia(LocalDate.now());

        DashboardDTO dashboard = new DashboardDTO(totalPacientes, totalOdontologos, totalCitas, citasDelDia);

        return ResponseEntity.ok(dashboard);
    }
}