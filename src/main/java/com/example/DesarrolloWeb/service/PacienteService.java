package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.enums.Rol;
import com.example.DesarrolloWeb.models.Paciente;
import com.example.DesarrolloWeb.models.Usuario;
import com.example.DesarrolloWeb.repository.PacienteRepository;
import com.example.DesarrolloWeb.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // AGREGAR NUEVO PACIENTE
    @Transactional
    public Paciente agregarPaciente(Paciente nuevoPaciente) {
        
        if (pacienteRepository.existsByDni(nuevoPaciente.getDni())) {
            throw new RuntimeException("El DNI " + nuevoPaciente.getDni() + " ya se encuentra registrado en el sistema.");
        }

        if (nuevoPaciente.getUsuario() != null) {
            Usuario usuario = nuevoPaciente.getUsuario();
            
            if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
                throw new RuntimeException("Error: El nombre de usuario ya está en uso");
            }
            
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            usuario.setRol(Rol.PACIENTE);
            
            usuario = usuarioRepository.save(usuario);
            
            nuevoPaciente.setUsuario(usuario);
        }

        return pacienteRepository.save(nuevoPaciente);
    }

    public Paciente editarPaciente(Long id, Paciente datosActualizados) {
        Paciente pacienteExistente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado en el sistema"));

        if (!pacienteExistente.getDni().equals(datosActualizados.getDni()) && 
            pacienteRepository.existsByDni(datosActualizados.getDni())) {
            throw new RuntimeException("El DNI " + datosActualizados.getDni() + " ya pertenece a otro paciente.");
        }

        pacienteExistente.setNombre(datosActualizados.getNombre());
        pacienteExistente.setApellido(datosActualizados.getApellido());
        pacienteExistente.setDni(datosActualizados.getDni());
        pacienteExistente.setTelefono(datosActualizados.getTelefono());

        return pacienteRepository.save(pacienteExistente);
    }

    // ver todos los pacientes
    public List<Paciente> obtenerTodosLosPacientes() {
        return pacienteRepository.findAll();
    }

    // Buscar por id
    public Paciente obtenerPacientePorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }

    // Cambiar estado activo/inactivo del paciente
    public Paciente cambiarEstado(Long id) {
        Paciente existente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        existente.setActivo(!existente.isActivo());
        return pacienteRepository.save(existente);
    }

}    // Obtener pacientes asignados al odontólogo logueado