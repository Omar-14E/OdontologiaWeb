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

    @PostMapping("/agendar")
    public ResponseEntity<Cita> agendar(@RequestBody Cita cita) {
        Cita citaGuardada = citaService.agendarCita(cita);
        return ResponseEntity.ok(citaGuardada);
    }

    @GetMapping("/odontologo/{id}")
    public ResponseEntity<List<Cita>> verAgenda(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.obtenerCitasDelOdontologo(id));
    }
}