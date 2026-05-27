package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.TurnoOdontologo;
import com.example.DesarrolloWeb.service.TurnoOdontologoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@CrossOrigin(origins = "http://localhost:4200")
public class TurnoOdontologoController {

    @Autowired
    private TurnoOdontologoService turnoService;

    @PostMapping("/asignar/{odontologoId}")
    public ResponseEntity<TurnoOdontologo> crearTurno(@PathVariable Long odontologoId, @RequestBody TurnoOdontologo nuevoTurno) {
        return ResponseEntity.ok(turnoService.crearTurnoParaDoctor(odontologoId, nuevoTurno));
    }

    @PutMapping("/mover/{turnoId}")
    public ResponseEntity<TurnoOdontologo> moverTurno(@PathVariable Long turnoId, @RequestBody TurnoOdontologo datoNuevo) {
        return ResponseEntity.ok(turnoService.moverTurno(turnoId, datoNuevo));
    }

    @DeleteMapping("/eliminar/{turnoId}")
    public ResponseEntity<Void> eliminarTurno(@PathVariable Long turnoId) {
        turnoService.eliminarTurno(turnoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vigentes/{odontologoId}")
    public ResponseEntity<List<TurnoOdontologo>> verTurnosVigentes(@PathVariable Long odontologoId) {
        return ResponseEntity.ok(turnoService.obtenerTurnosVigentes(odontologoId));
    }
}