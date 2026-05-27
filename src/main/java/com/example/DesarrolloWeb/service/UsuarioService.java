package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.enums.Rol;
import com.example.DesarrolloWeb.models.Usuario;
import com.example.DesarrolloWeb.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> obtenerOdontologos() {
        return usuarioRepository.findByRol(Rol.ODONTOLOGO);
    }
}