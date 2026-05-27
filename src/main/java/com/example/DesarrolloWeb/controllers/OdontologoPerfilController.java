package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.Paciente;
import com.example.DesarrolloWeb.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/mi-perfil")
@CrossOrigin(origins = "http://localhost:4200")
public class OdontologoPerfilController {

    @Autowired
    private CitaRepository citaRepository;

    @GetMapping("/citas")
    public ResponseEntity<List<Cita>> getMisCitas(Principal principal) {
        // Principal.getName() obtiene automáticamente el username del token JWT
        List<Cita> misCitas = citaRepository.findCitasByOdontologoUsername(principal.getName());
        return ResponseEntity.ok(misCitas);
    }

    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> getMisPacientes(Principal principal) {
        List<Paciente> misPacientes = citaRepository.findPacientesByOdontologoUsername(principal.getName());
        return ResponseEntity.ok(misPacientes);
    }
}