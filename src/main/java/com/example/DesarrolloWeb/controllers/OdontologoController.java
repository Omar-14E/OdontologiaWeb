package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.enums.Especialidad;
import com.example.DesarrolloWeb.models.Odontologo;
import com.example.DesarrolloWeb.service.OdontologoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/odontologos")
@CrossOrigin(origins = "http://localhost:4200")
public class OdontologoController {

    @Autowired
    private OdontologoService odontologoService;

    @GetMapping
    public ResponseEntity<List<Odontologo>> listarTodos() {
        return ResponseEntity.ok(odontologoService.obtenerTodos());
    }

    @GetMapping("/especialidad/{especialidad}")
    public ResponseEntity<List<Odontologo>> listarPorEspecialidad(@PathVariable Especialidad especialidad) {
        return ResponseEntity.ok(odontologoService.obtenerPorEspecialidad(especialidad));
    }

    @PostMapping("/registrar")
    public ResponseEntity<Odontologo> registrar(@RequestBody Odontologo odontologo) {
        return ResponseEntity.ok(odontologoService.guardarOdontologo(odontologo));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Odontologo> actualizar(@PathVariable Long id, @RequestBody Odontologo datoNuevo) {
        return ResponseEntity.ok(odontologoService.actualizarOdontologo(id, datoNuevo));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        odontologoService.eliminarOdontolodo(id);
        return ResponseEntity.noContent().build();
    }
}