package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.Odontograma;
import com.example.DesarrolloWeb.service.OdontogramaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/odontograma")
@CrossOrigin(origins = "http://localhost:4200")
public class OdontogramaController {

    @Autowired
    private OdontogramaService odontogramaService;

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Odontograma>> verOdontograma(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(odontogramaService.obtenerPorPaciente(pacienteId));
    }

    @PostMapping("/registrar")
    public ResponseEntity<Odontograma> registrarDiente(@RequestBody Odontograma registro) {
        return ResponseEntity.ok(odontogramaService.guardarRegistro(registro));
    }
}