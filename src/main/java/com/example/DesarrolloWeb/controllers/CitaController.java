package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.service.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:4200")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @GetMapping
    public ResponseEntity<List<Cita>> obtenerTodas() {
        return ResponseEntity.ok(citaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.obtenerCitaPorId(id));
    }

    @PostMapping("/registrar")
    public ResponseEntity<Cita> registrar(@RequestBody Cita cita) {
        Cita citaGuardada = citaService.crearCita(cita);
        return ResponseEntity.ok(citaGuardada);
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Cita> actualizar(@PathVariable Long id, @RequestBody Cita cita) {
        Cita citaActualizada = citaService.editarCita(id, cita);
        return ResponseEntity.ok(citaActualizada);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        citaService.eliminarCita(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/odontologo/{id}")
    public ResponseEntity<List<Cita>> verAgenda(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.obtenerCitasPorOdontologo(id));
    }

    @GetMapping("/disponibilidad")
    public ResponseEntity<List<String>> obtenerDisponibilidad(
            @RequestParam Long odontologoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        List<String> horarios = citaService.obtenerHorariosDisponibles(odontologoId, fecha);
        return ResponseEntity.ok(horarios);
    }
}