package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.dto.DashboardDTO;
import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.repository.CitaRepository;
import com.example.DesarrolloWeb.repository.OdontologoRepository;
import com.example.DesarrolloWeb.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
        long totalPacientes = pacienteRepository.count();
        long totalOdontologos = odontologoRepository.count();
        long totalCitas = citaRepository.count();

        long citasDelDia = citaRepository.contarCitasDelDia(LocalDate.now());

        DashboardDTO dashboard = new DashboardDTO(totalPacientes, totalOdontologos, totalCitas, citasDelDia);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/odontologo/{id}")
    public ResponseEntity<?> obtenerDashboardOdontologo(@PathVariable Long id) {
        // 1. Definimos los rangos de tiempo (Ej: Desde hoy hasta dentro de 7 días para "la semana")
        LocalDateTime inicioSemana = LocalDate.now().atStartOfDay();
        LocalDateTime finSemana = LocalDate.now().plusDays(7).atTime(23, 59, 59);

        LocalDateTime inicioMes = LocalDate.now().atStartOfDay();
        LocalDateTime finMes = LocalDate.now().plusDays(30).atTime(23, 59, 59);

        // 2. Usamos los nuevos métodos del repositorio
        long citasEstaSemana = citaRepository.countByOdontologoIdAndFechaHoraBetween(id, inicioSemana, finSemana);
        long citasEsteMes = citaRepository.countByOdontologoIdAndFechaHoraBetween(id, inicioMes, finMes);

        // Opcional: También puedes devolver la lista de citas exactas que le tocan hoy
        LocalDateTime finHoy = LocalDate.now().atTime(23, 59, 59);
        List<Cita> listaCitasHoy = citaRepository.findByOdontologoIdAndFechaHoraBetween(id, inicioSemana, finHoy);

        // 3. Puedes crear un nuevo DTO (DashboardOdontologoDTO) o devolver un Map rápido
        return ResponseEntity.ok(java.util.Map.of(
                "citasEstaSemana", citasEstaSemana,
                "citasEsteMes", citasEsteMes,
                "proximosPacientes", listaCitasHoy
        ));
    }
}