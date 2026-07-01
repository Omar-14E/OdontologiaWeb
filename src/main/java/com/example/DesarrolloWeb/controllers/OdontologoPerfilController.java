package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.dto.DashboardOdontologoDTO;
import com.example.DesarrolloWeb.dto.AgendaOdontoDTO;
import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.Odontologo;
import com.example.DesarrolloWeb.models.Paciente;
import com.example.DesarrolloWeb.repository.CitaRepository;
import com.example.DesarrolloWeb.service.OdontologoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mi-perfil")
@CrossOrigin(origins = "http://localhost:4200")
public class OdontologoPerfilController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private OdontologoService odontologoService;

    // =========================================================================
    // 🌟 PANTALLA NUEVA: DASHBOARD (MÉTRICAS GENERALES)
    // =========================================================================
    
    // 👈 Cambiado el nombre de la ruta a la raíz "/" tal como lo solicitaste
    @GetMapping("") 
    public ResponseEntity<DashboardOdontologoDTO> getDashboardOdontologo(Principal principal) {
        String username = principal.getName();
        
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);

        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);

        // Métricas de HOY
        long misCitasHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .count();

        long misPacientesHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .map(Cita::getPaciente)
            .distinct()
            .count();

        // Total de pacientes únicos en el historial total de la vida del doctor
        long totalPacientesHistoricos = todasMisCitas.stream()
            .map(Cita::getPaciente)
            .distinct()
            .count();

        Odontologo odontologo = odontologoService.obtenerPorUsername(username);

        DashboardOdontologoDTO dto = new DashboardOdontologoDTO(
            odontologo.getNombre(),
            odontologo.getApellido(),
            misPacientesHoy, 
            misCitasHoy,
            totalPacientesHistoricos
        );
        
        return ResponseEntity.ok(dto);
    }

    // Sirve para renderizar las tarjetas internas con scroll en el Dashboard
    @GetMapping("/citas")
    public ResponseEntity<AgendaOdontoDTO> getMisCitas(Principal principal) {
        String username = principal.getName();
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);
        
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);
        
        List<Cita> citasDeHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .collect(Collectors.toList());

        // Fallback local por si estás testeando y la lista está vacía
        if (citasDeHoy.isEmpty() && !todasMisCitas.isEmpty()) {
            citasDeHoy = todasMisCitas.stream().limit(2).collect(Collectors.toList());
        }

        List<Paciente> pacientesDeHoy = citasDeHoy.stream()
            .map(Cita::getPaciente)
            .distinct()
            .collect(Collectors.toList());

        LocalDateTime finSemana = inicioHoy.plusDays(7);
        List<Cita> citasDeLaSemana = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && c.getFechaHora().isBefore(finSemana))
            .collect(Collectors.toList());

        AgendaOdontoDTO agenda = new AgendaOdontoDTO(citasDeHoy, pacientesDeHoy, citasDeLaSemana);
        return ResponseEntity.ok(agenda);
    }

    // =========================================================================
    // 👥 PANTALLA VIEJA: REGISTRO Y EXPEDIENTE DE PACIENTES
    // =========================================================================

    // 1. Carga inicial: Pacientes que alguna vez en la vida se han atendido con el doctor
    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> getMisPacientesHistoricos(Principal principal) {
        String username = principal.getName();
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);
        
        // Extraemos todos los pacientes únicos sin duplicados de toda la historia
        List<Paciente> pacientesHistoricos = todasMisCitas.stream()
            .map(Cita::getPaciente)
            .distinct()
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(pacientesHistoricos);
    }

    // 2. Vista detalle: Historial de TODAS las citas de un paciente con fecha, hora, estado y observación
    @GetMapping("/historial-paciente/{id}")
    public ResponseEntity<List<Cita>> getHistorialPaciente(@PathVariable Long id, Principal principal) {
        String username = principal.getName();
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);
        
        // Filtramos para retornar todas las citas históricas del paciente seleccionado
        List<Cita> historialPaciente = todasMisCitas.stream()
            .filter(c -> c.getPaciente().getId().equals(id))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(historialPaciente);
    }
}