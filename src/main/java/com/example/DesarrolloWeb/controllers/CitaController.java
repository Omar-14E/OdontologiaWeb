package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.service.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:4200")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @GetMapping
    public ResponseEntity<List<Cita>> listarTodas() {
        return ResponseEntity.ok(citaService.obtenerTodasLasCitas());
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
        return ResponseEntity.ok(citaService.editarCita(id, cita));
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
}