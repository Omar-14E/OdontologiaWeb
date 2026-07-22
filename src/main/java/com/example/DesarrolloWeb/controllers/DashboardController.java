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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/citas-hoy")
    public ResponseEntity<List<Map<String, Object>>> getCitasHoy() {
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(23, 59, 59);

        List<Cita> citasBD = citaRepository.findByFechaHoraBetween(inicioHoy, finHoy);
        List<Map<String, Object>> respuestaAngular = new ArrayList<>();

        DateTimeFormatter formatterHora = DateTimeFormatter.ofPattern("hh:mm");
        DateTimeFormatter formatterMeridiano = DateTimeFormatter.ofPattern("a");

        for (Cita cita : citasBD) {
            Map<String, Object> map = new HashMap<>();
            
            map.put("horaFormateada", cita.getFechaHora().format(formatterHora));
            map.put("meridiano", cita.getFechaHora().format(formatterMeridiano));
            
            Map<String, String> pacienteMap = new HashMap<>();
            pacienteMap.put("nombre", cita.getPaciente().getNombre());
            pacienteMap.put("apellido", cita.getPaciente().getApellido());
            map.put("paciente", pacienteMap);
            
            Map<String, String> odontologoMap = new HashMap<>();
            odontologoMap.put("nombre", cita.getOdontologo().getNombre());
            map.put("odontologo", odontologoMap);
            
            map.put("especialidad", "Odontología");
            map.put("estado", cita.getEstado().toString());
            
            respuestaAngular.add(map);
        }

        return ResponseEntity.ok(respuestaAngular);
    }

    @GetMapping("/tratamientos")
    public ResponseEntity<List<Map<String, Object>>> getTratamientos(@RequestParam(defaultValue = "mes") String filtro) {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicio;
        LocalDateTime fin;

        if ("anterior".equals(filtro)) {
            LocalDate primerDiaMesAnterior = hoy.minusMonths(1).withDayOfMonth(1);
            LocalDate ultimoDiaMesAnterior = hoy.withDayOfMonth(1).minusDays(1);
            inicio = primerDiaMesAnterior.atStartOfDay();
            fin = ultimoDiaMesAnterior.atTime(23, 59, 59);
        } else {
            inicio = hoy.withDayOfMonth(1).atStartOfDay();
            fin = hoy.atTime(23, 59, 59);
        }

        List<Cita> citasDelPeriodo = citaRepository.findByFechaHoraBetween(inicio, fin);

        // Agrupar citas por especialidad del odontólogo
        Map<String, Long> conteo = new HashMap<>();
        for (Cita cita : citasDelPeriodo) {
            String especialidad = cita.getOdontologo().getEspecialidad() != null
                    ? cita.getOdontologo().getEspecialidad().name()
                    : "GENERAL";
            conteo.put(especialidad, conteo.getOrDefault(especialidad, 0L) + 1);
        }

        // Calcular el máximo para los porcentajes relativos
        long maxCitas = conteo.values().stream().mapToLong(Long::longValue).max().orElse(1);

        List<Map<String, Object>> tratamientos = new ArrayList<>();
        for (Map.Entry<String, Long> entry : conteo.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("nombre", entry.getKey());
            item.put("cantidad", entry.getValue());
            item.put("porcentaje", (int) ((entry.getValue() * 100) / maxCitas));
            tratamientos.add(item);
        }

        // Ordenar de mayor a menor
        tratamientos.sort((a, b) -> ((Integer) b.get("porcentaje")).compareTo((Integer) a.get("porcentaje")));

        return ResponseEntity.ok(tratamientos);
    }

    @GetMapping("/odontologo/{id}")
    public ResponseEntity<?> obtenerDashboardOdontologo(@PathVariable Long id) {
        LocalDateTime inicioSemana = LocalDate.now().atStartOfDay();
        LocalDateTime finSemana = LocalDate.now().plusDays(7).atTime(23, 59, 59);

        LocalDateTime inicioMes = LocalDate.now().atStartOfDay();
        LocalDateTime finMes = LocalDate.now().plusDays(30).atTime(23, 59, 59);

        long citasEstaSemana = citaRepository.countByOdontologoIdAndFechaHoraBetween(id, inicioSemana, finSemana);
        long citasEsteMes = citaRepository.countByOdontologoIdAndFechaHoraBetween(id, inicioMes, finMes);

        LocalDateTime finHoy = LocalDate.now().atTime(23, 59, 59);
        List<Cita> listaCitasHoy = citaRepository.findByOdontologoIdAndFechaHoraBetween(id, inicioSemana, finHoy);

        return ResponseEntity.ok(java.util.Map.of(
                "citasEstaSemana", citasEstaSemana,
                "citasEsteMes", citasEsteMes,
                "proximosPacientes", listaCitasHoy
        ));
    }
}