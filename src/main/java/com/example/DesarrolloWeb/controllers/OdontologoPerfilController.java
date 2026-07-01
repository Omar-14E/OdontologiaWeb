package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.dto.DashboardOdontologoDTO;
import com.example.DesarrolloWeb.dto.AgendaOdontoDTO;
import com.example.DesarrolloWeb.dto.PerfilOdontoDTO;
import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.Odontologo;
import com.example.DesarrolloWeb.models.Paciente;
import com.example.DesarrolloWeb.models.TurnoOdontologo;
import com.example.DesarrolloWeb.models.Usuario;
import com.example.DesarrolloWeb.repository.CitaRepository;
import com.example.DesarrolloWeb.repository.UsuarioRepository;
import com.example.DesarrolloWeb.service.OdontologoService;
import com.example.DesarrolloWeb.service.TurnoOdontologoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mi-perfil")
@CrossOrigin(origins = "http://localhost:4200")
public class OdontologoPerfilController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private OdontologoService odontologoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TurnoOdontologoService turnoOdontologoService;

    // =========================================================================
    // 🌟 PANTALLA: DASHBOARD (MÉTRICAS GENERALES ORIGINAL)
    // =========================================================================
    @GetMapping("") 
    public ResponseEntity<DashboardOdontologoDTO> getDashboardOdontologo(Principal principal) {
        String username = principal.getName();
        
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);

        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);

        long misCitasHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .count();

        long misPacientesHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .map(Cita::getPaciente)
            .distinct()
            .count();

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

    @GetMapping("/citas")
    public ResponseEntity<AgendaOdontoDTO> getMisCitas(Principal principal) {
        String username = principal.getName();
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);
        
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);
        
        List<Cita> citasDeHoy = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioHoy) && !c.getFechaHora().isAfter(finHoy))
            .collect(Collectors.toList());

        List<Paciente> pacientesDeHoy = citasDeHoy.stream()
            .map(Cita::getPaciente)
            .distinct()
            .collect(Collectors.toList());

        LocalDate hoy = LocalDate.now();
        LocalDate lunesDeEstaSemana = hoy.minusDays(hoy.getDayOfWeek().getValue() - 1);
        LocalDate domingoDeEstaSemana = lunesDeEstaSemana.plusDays(6);

        LocalDateTime inicioDeSemana = lunesDeEstaSemana.atStartOfDay();
        LocalDateTime finDeSemana = domingoDeEstaSemana.atTime(LocalTime.MAX);

        List<Cita> citasDeLaSemana = todasMisCitas.stream()
            .filter(c -> !c.getFechaHora().isBefore(inicioDeSemana) && !c.getFechaHora().isAfter(finDeSemana))
            .collect(Collectors.toList());

        AgendaOdontoDTO agenda = new AgendaOdontoDTO(citasDeHoy, pacientesDeHoy, citasDeLaSemana);
        return ResponseEntity.ok(agenda);
    }

    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> getMisPacientesHistoricos(Principal principal) {
        String username = principal.getName();
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);
        
        List<Paciente> pacientesHistoricos = todasMisCitas.stream()
            .map(Cita::getPaciente)
            .distinct()
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(pacientesHistoricos);
    }

    @GetMapping("/historial-paciente/{id}")
    public ResponseEntity<List<Cita>> getHistorialPaciente(@PathVariable Long id, Principal principal) {
        String username = principal.getName();
        List<Cita> todasMisCitas = citaRepository.findCitasByOdontologoUsername(username);
        
        List<Cita> historialPaciente = todasMisCitas.stream()
            .filter(c -> c.getPaciente().getId().equals(id))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(historialPaciente);
    }

    @GetMapping("/detalles")
    public ResponseEntity<PerfilOdontoDTO> getPerfilDetallado(Principal principal) {
        String username = principal.getName();
        Odontologo odontologo = odontologoService.obtenerPorUsername(username);
        
        PerfilOdontoDTO dto = new PerfilOdontoDTO(
            odontologo.getNombre(),
            odontologo.getApellido(),
            odontologo.getTelefono(),
            odontologo.getEspecialidad(),
            odontologo.getUsuario().getUsername(),
            odontologo.getUsuario().getGmail()
        );
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/actualizar")
    @Transactional
    public ResponseEntity<?> actualizarMisDatos(@RequestBody Map<String, String> datos, Principal principal) {
        String username = principal.getName();
        Odontologo odontologo = odontologoService.obtenerPorUsername(username);

        String nuevoTelefono = datos.get("telefono");
        if (nuevoTelefono == null || !nuevoTelefono.matches("^9[0-9]{8}$")) {
            return ResponseEntity.badRequest().body("El teléfono debe empezar con 9 y tener exactamente 9 dígitos.");
        }
        odontologo.setTelefono(nuevoTelefono);
        odontologoService.actualizarOdontologo(odontologo.getId(), odontologo);

        String nuevoPassword = datos.get("password");
        if (nuevoPassword != null && !nuevoPassword.trim().isEmpty()) {
            if (nuevoPassword.length() < 8) {
                return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 8 caracteres.");
            }
            Usuario usuario = odontologo.getUsuario();
            usuario.setPassword(passwordEncoder.encode(nuevoPassword.trim()));
            usuarioRepository.save(usuario);
        }

        return ResponseEntity.ok().body(Map.of("message", "Perfil actualizado con éxito"));
    }

    @GetMapping("/mis-turnos-semana")
    public ResponseEntity<List<TurnoOdontologo>> getMisTurnosDeLaSemana(Principal principal) {
        String username = principal.getName();
        Odontologo odontologo = odontologoService.obtenerPorUsername(username);
        
        List<TurnoOdontologo> todosLosTurnos = turnoOdontologoService.obtenerTurnosVigentes(odontologo.getId());
        
        LocalDate hoy = LocalDate.now();
        LocalDate lunes = hoy.minusDays(hoy.getDayOfWeek().getValue() - 1);
        LocalDate domingo = lunes.plusDays(6);
        
        List<TurnoOdontologo> turnosSemanaActual = todosLosTurnos.stream()
            .filter(t -> !t.getFecha().isBefore(lunes) && !t.getFecha().isAfter(domingo))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(turnosSemanaActual);
    }

    // =========================================================================
    // 🆕 NUEVO ENDPOINT AISLADO: EXCLUSIVO PARA EL HORARIO REAL DE HOY
    // =========================================================================
    @GetMapping("/horario-hoy")
    public ResponseEntity<Map<String, Object>> getHorarioDeHoy(Principal principal) {
        String username = principal.getName();
        LocalDate hoy = LocalDate.now();
        Odontologo odontologo = odontologoService.obtenerPorUsername(username);

        List<TurnoOdontologo> todosLosTurnos = turnoOdontologoService.obtenerTurnosVigentes(odontologo.getId());
        
        TurnoOdontologo turnoDeHoy = todosLosTurnos.stream()
            .filter(t -> t.getFecha().equals(hoy))
            .findFirst()
            .orElse(null);

        Map<String, Object> horarioData = new java.util.HashMap<>();
        
        if (turnoDeHoy != null) {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            horarioData.put("tieneTurno", true);
            horarioData.put("entrada", turnoDeHoy.getHoraInicio().format(formatter));
            horarioData.put("salida", turnoDeHoy.getHoraFin().format(formatter));
        } else {
            horarioData.put("tieneTurno", false);
            horarioData.put("entrada", null);
            horarioData.put("salida", null);
        }

        return ResponseEntity.ok(horarioData);
    }
}