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

    @GetMapping("/odonto-dashboard")
    public ResponseEntity<DashboardOdontologoDTO> getDashboardOdontologo(Principal principal) {
        String username = principal.getName();
        
        // 1. Obtener los límites del día de HOY real del sistema
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay(); // 2026-06-28 00:00:00
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);    // 2026-06-28 23:59:59

        // 2. Obtener todas las citas históricas del médico
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);

        // 3. Filtrar métricas reales del día de HOY
        long misCitasHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .count();

        long misPacientesHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .map(Cita::getPaciente)
            .distinct()
            .count();

        // 4. Obtener datos del médico
        Odontologo odontologo = odontologoService.obtenerPorUsername(username);

        DashboardOdontologoDTO dto = new DashboardOdontologoDTO(
            odontologo.getNombre(),
            odontologo.getApellido(),
            misPacientesHoy, // Muestra los pacientes reales agendados para HOY
            misCitasHoy      // Muestra las citas reales de HOY
        );
        
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/citas")
    public ResponseEntity<AgendaOdontoDTO> getMisCitas(Principal principal) {
        String username = principal.getName();
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);
        
        // Rango de fechas reales para HOY
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);
        
        // Rango de la semana real (próximos 7 días)
        LocalDateTime finSemana = inicioHoy.plusDays(7);

        // 1. Filtrar las citas correspondientes al día de HOY
        List<Cita> citasDeHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .collect(Collectors.toList());

        // 2. Extraer los pacientes de HOY
        List<Paciente> pacientesDeHoy = citasDeHoy.stream()
            .map(Cita::getPaciente)
            .distinct()
            .collect(Collectors.toList());

        // 3. Filtrar las citas de la semana entera (Próximos 7 días reales)
        List<Cita> citasDeLaSemana = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && c.getFechaHora().isBefore(finSemana))
            .collect(Collectors.toList());

        AgendaOdontoDTO agenda = new AgendaOdontoDTO(citasDeHoy, pacientesDeHoy, citasDeLaSemana);
        return ResponseEntity.ok(agenda);
    }

    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> getMisPacientes(Principal principal) {
        List<Paciente> misPacientes = citaRepository.findPacientesByOdontologoUsername(principal.getName());
        return ResponseEntity.ok(misPacientes);
    }
}