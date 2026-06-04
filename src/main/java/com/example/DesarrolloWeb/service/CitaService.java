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
        validarDisponibilidad(nuevaCita); // Llamamos al método ayudante
        return citaRepository.save(nuevaCita);
    }

    // EDITAR CITA
    @Transactional
    public Cita editarCita(Long id, Cita datosActualizados) {
        Cita citaExistente = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!citaExistente.getFechaHora().equals(datosActualizados.getFechaHora()) ||
                !citaExistente.getOdontologo().getId().equals(datosActualizados.getOdontologo().getId())) {

            validarDisponibilidad(datosActualizados); // Validamos los nuevos datos

            citaExistente.setFechaHora(datosActualizados.getFechaHora());
            citaExistente.setOdontologo(datosActualizados.getOdontologo());
        }

        citaExistente.setEstado(datosActualizados.getEstado());

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

<<<<<<< HEAD
=======
    //VER TODAS LAS CITAS
    public List<Cita> obtenerTodas() {
        return citaRepository.findAll();
    }

    // MÉTODO PRIVADO AYUDANTE (Reutilizable)
>>>>>>> 3ff22dedcd14ab339cefa793cb56ffe20c72b3a1
    private void validarDisponibilidad(Cita cita) {

        /* ======================================================================
           TEMPORALMENTE DESACTIVADO: Validación estricta de Turnos del Doctor
           ======================================================================
        LocalDate fechaSolicitada = cita.getFechaHora().toLocalDate();
        LocalTime horaSolicitada = cita.getFechaHora().toLocalTime();
        Long idDoctor = cita.getOdontologo().getId();

        List<TurnoOdontologo> turnosDelDia = turnoRepository.findByOdontologoIdAndFecha(idDoctor, fechaSolicitada);

        if (!turnosDelDia.isEmpty()) {
            boolean horaValida = false;
            for (TurnoOdontologo turno : turnosDelDia) {
                // Usamos !isBefore y !isAfter para incluir los extremos (inicio y fin)
                if (!horaSolicitada.isBefore(turno.getHoraInicio()) && !horaSolicitada.isAfter(turno.getHoraFin())) {
                    horaValida = true;
                    break;
                }
            }

            if (!horaValida) {
                throw new RuntimeException("La hora seleccionada (" + horaSolicitada + ") está fuera del horario de atención.");
            }
        }


        boolean doctorOcupado = citaRepository.existsByOdontologoIdAndFechaHoraAndEstado(idDoctor, cita.getFechaHora(), EstadoCita.PENDIENTE);

        if (doctorOcupado) {
            throw new RuntimeException("El doctor ya tiene una cita reservada en ese horario exacto.");
        }

         */

        if (cita.getOdontologo() == null || cita.getOdontologo().getId() == null) {
            throw new RuntimeException("Error: La cita debe tener un odontólogo asignado.");
        }

        Long idDoctor = cita.getOdontologo().getId();
        LocalDateTime fechaHoraSolicitada = cita.getFechaHora();

        // 2. ÚNICA VALIDACIÓN ACTIVA: Evitar cruce de citas
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