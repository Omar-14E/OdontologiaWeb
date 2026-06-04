package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.Paciente;
import com.example.DesarrolloWeb.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "http://localhost:4200")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    @GetMapping
    public ResponseEntity<List<Paciente>> listarPacientes() {
        return ResponseEntity.ok(pacienteService.obtenerTodosLosPacientes());
    }

    @PostMapping("/registrar")
    public ResponseEntity<Paciente> registrarPaciente(@RequestBody Paciente paciente) {
        return ResponseEntity.ok(pacienteService.agregarPaciente(paciente));
    }

    // 👇 Métodos corregidos usando los nombres exactos de tu PacienteService 👇

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.obtenerPacientePorId(id));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Paciente> actualizar(@PathVariable Long id, @RequestBody Paciente datoNuevo) {
        return ResponseEntity.ok(pacienteService.editarPaciente(id, datoNuevo));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.noContent().build();
    }

}