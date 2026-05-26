package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.Usuario;
import com.example.DesarrolloWeb.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/odontologos")
    public ResponseEntity<List<Usuario>> listarOdontologos() {
        return ResponseEntity.ok(usuarioService.obtenerOdontologos());
    }
}