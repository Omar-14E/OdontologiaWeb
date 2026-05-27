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

    // 1. LISTAR TODAS (Lo que Angular llama al cargar la página)
    @GetMapping
    public ResponseEntity<List<Cita>> obtenerTodas() {
        return ResponseEntity.ok(citaService.obtenerTodas());
    }

    // 2. REGISTRAR (Angular apunta a /registrar)
    @PostMapping("/registrar")
    public ResponseEntity<Cita> registrar(@RequestBody Cita cita) {
        Cita citaGuardada = citaService.crearCita(cita);
        return ResponseEntity.ok(citaGuardada);
    }

    // 3. ACTUALIZAR (Angular apunta a /actualizar/{id})
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Cita> actualizar(@PathVariable Long id, @RequestBody Cita cita) {
        Cita citaActualizada = citaService.editarCita(id, cita);
        return ResponseEntity.ok(citaActualizada);
    }

    // 4. ELIMINAR (Angular apunta a /eliminar/{id})
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        citaService.eliminarCita(id);
        return ResponseEntity.noContent().build();
    }

    // Este lo dejamos por si lo usas en otra vista
    @GetMapping("/odontologo/{id}")
    public ResponseEntity<List<Cita>> verAgenda(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.obtenerCitasPorOdontologo(id));
    }
}