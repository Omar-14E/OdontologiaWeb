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

    // Inyectamos las herramientas para crear el usuario correctamente
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // AGREGAR NUEVO PACIENTE
    @Transactional // Esto asegura que si falla la creación del paciente, tampoco se guarde el usuario (todo o nada)
    public Paciente agregarPaciente(Paciente nuevoPaciente) {
        
        // 1. Validar DNI de forma optimizada (sin traer toda la lista de la BD)
        if (pacienteRepository.findByDni(nuevoPaciente.getDni()).isPresent()) {
            throw new RuntimeException("Error: Ya existe un paciente registrado con el DNI " + nuevoPaciente.getDni());
        }

        // 2. Extraer y procesar el Usuario (si el frontend envía datos de login)
        if (nuevoPaciente.getUsuario() != null) {
            Usuario usuario = nuevoPaciente.getUsuario();
            
            // Validar que el username no exista ya
            if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
                throw new RuntimeException("Error: El nombre de usuario ya está en uso");
            }
            
            // Encriptar contraseña y asignar rol por defecto
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            usuario.setRol(Rol.PACIENTE);
            
            // Guardar el usuario primero en la BD
            usuario = usuarioRepository.save(usuario);
            
            // Vincular el usuario recién creado al paciente
            nuevoPaciente.setUsuario(usuario);
        }

        return pacienteRepository.save(nuevoPaciente);
    }

    // editar datos del paciente
    public Paciente editarPaciente(Long id, Paciente datosActualizados) {
        Paciente pacienteExistente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado en el sistema"));

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

    // Eliminar paciente
    public void eliminarPaciente(Long id) {
        if (!pacienteRepository.existsById(id)) {
            throw new RuntimeException("Paciente no encontrado para eliminar");
        }
        pacienteRepository.deleteById(id);
    }

}    // Obtener pacientes asignados al odontólogo logueado