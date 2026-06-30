package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.enums.EstadoCita;
import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.TurnoOdontologo;
import com.example.DesarrolloWeb.repository.CitaRepository;
import com.example.DesarrolloWeb.repository.TurnoOdontologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private TurnoOdontologoRepository turnoRepository;

    // CREAR CITA
    @Transactional
    public Cita crearCita(Cita nuevaCita) {

        // === NUEVA VALIDACIÓN PARA EL ADMINISTRADOR ===
        if (nuevaCita.getFechaHora() != null && nuevaCita.getFechaHora().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("No puedes programar una cita en el pasado");
        }

        validarDisponibilidad(nuevaCita); // Llamamos al método ayudante
        return citaRepository.save(nuevaCita);
    }

    // EDITAR CITA
    @Transactional
    public Cita editarCita(Long id, Cita datosActualizados) {
        Cita citaExistente = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // ¿El Administrador está reprogramando la cita?
        if ((datosActualizados.getFechaHora() != null && !citaExistente.getFechaHora().equals(datosActualizados.getFechaHora())) ||
            (datosActualizados.getOdontologo() != null && datosActualizados.getOdontologo().getId() != null && 
            !citaExistente.getOdontologo().getId().equals(datosActualizados.getOdontologo().getId()))) {

            // Si el admin cambia la fecha a una nueva, también validamos que no sea en el pasado
            if (datosActualizados.getFechaHora().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("No puedes reprogramar una cita al pasado");
            }

            validarDisponibilidad(datosActualizados); 

            citaExistente.setFechaHora(datosActualizados.getFechaHora());
            citaExistente.setOdontologo(datosActualizados.getOdontologo());
        }

        // ¿El Doctor está atendiendo la cita?
        if (datosActualizados.getEstado() != null) {
            citaExistente.setEstado(datosActualizados.getEstado());
        }
        
        citaExistente.setObservaciones(datosActualizados.getObservaciones()); 

        return citaRepository.save(citaExistente);
    }

    // ELIMINAR CITA
    @Transactional
    public void eliminarCita(Long id) {
        citaRepository.deleteById(id);
    }

    // VER CITAS POR PACIENTE
    public List<Cita> obtenerCitasPorPaciente(Long pacienteId) {
        return citaRepository.findByPacienteId(pacienteId);
    }

    // VER CITAS POR ODONTÓLOGO
    public List<Cita> obtenerCitasPorOdontologo(Long odontologoId) {
        return citaRepository.findByOdontologoId(odontologoId);
    }

    public List<Cita> obtenerCitasPorDia(LocalDate fecha) {
        // Como la base de datos guarda Fecha y Hora, buscamos desde las 00:00 hasta las 23:59 de ese día
        LocalDateTime inicioDelDia = fecha.atStartOfDay();
        LocalDateTime finDelDia = fecha.atTime(LocalTime.MAX);

        return citaRepository.findByFechaHoraBetween(inicioDelDia, finDelDia);
    }

    //VER TODAS LAS CITAS
    public List<Cita> obtenerTodas() {
        return citaRepository.findAll();
    }

    // MÉTODO PRIVADO AYUDANTE (Reutilizable)
    private void validarDisponibilidad(Cita cita) {

        if (cita.getOdontologo() == null || cita.getOdontologo().getId() == null) {
            throw new RuntimeException("Error: La cita debe tener un odontólogo asignado.");
        }

        Long idDoctor = cita.getOdontologo().getId();
        LocalDateTime fechaHoraSolicitada = cita.getFechaHora();
        LocalDate fechaSolicitada = fechaHoraSolicitada.toLocalDate();
        LocalTime horaSolicitada = fechaHoraSolicitada.toLocalTime();

        // 1. VALIDACIÓN ESTRICTA: El doctor debe tener turno ese día y a esa hora
        List<TurnoOdontologo> turnosDelDia = turnoRepository.findByOdontologoIdAndFecha(idDoctor, fechaSolicitada);

        if (turnosDelDia.isEmpty()) {
            throw new RuntimeException("El doctor no tiene turnos programados para este día.");
        } else {
            boolean horaValida = false;
            for (TurnoOdontologo turno : turnosDelDia) {
                if (!horaSolicitada.isBefore(turno.getHoraInicio()) && !horaSolicitada.isAfter(turno.getHoraFin())) {
                    horaValida = true;
                    break;
                }
            }
            if (!horaValida) {
                throw new RuntimeException("La hora seleccionada (" + horaSolicitada + ") está fuera del horario de atención del doctor.");
            }
        }

        // 2. EVITAR CRUCES: El doctor no puede tener dos citas al mismo tiempo
        boolean doctorOcupado = citaRepository.existsByOdontologoIdAndFechaHoraAndEstado(
                idDoctor,
                fechaHoraSolicitada,
                EstadoCita.PENDIENTE
        );

        if (doctorOcupado) {
            throw new RuntimeException("El doctor ya tiene una cita reservada en ese horario exacto.");
        }
    }

    public List<Cita> obtenerTodasLasCitas() {
        return citaRepository.findAll();
    }

    public Cita obtenerCitaPorId(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
    }
}