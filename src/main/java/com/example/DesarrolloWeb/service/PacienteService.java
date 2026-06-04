package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.models.Paciente;
import com.example.DesarrolloWeb.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;

    // AGREGAR NUEVO PACIENTE
    public Paciente agregarPaciente(Paciente nuevoPaciente) {
        List<Paciente> todosLosPacientes = pacienteRepository.findAll();

        for (Paciente paciente : todosLosPacientes) {
            if (paciente.getDni().equals(nuevoPaciente.getDni())) {

                throw new RuntimeException("Error: Ya existe un paciente registrado con el DNI " + nuevoPaciente.getDni());
            }
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
}