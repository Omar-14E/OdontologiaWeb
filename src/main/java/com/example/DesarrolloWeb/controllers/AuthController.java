package com.example.DesarrolloWeb.controllers;

import com.example.DesarrolloWeb.models.Usuario;
import com.example.DesarrolloWeb.repository.UsuarioRepository;
import com.example.DesarrolloWeb.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {

        String username = credenciales.get("username").trim().toLowerCase();
        String password = credenciales.get("password").trim();

        Usuario usuario = usuarioRepository.findByUsernameOrGmail(username, username) // busca usuario o correo
                .orElse(null);

        if (usuario != null && passwordEncoder.matches(password, usuario.getPassword())) {
            String token = jwtUtil.generarToken(usuario.getUsername(), usuario.getRol().name());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "rol", usuario.getRol().name(),
                    "username", usuario.getUsername()));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
    }
}