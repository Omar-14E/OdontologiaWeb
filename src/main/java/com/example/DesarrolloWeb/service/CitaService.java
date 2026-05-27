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

        // Si se cambió la fecha, la hora o el doctor, VOLVEMOS a validar
        if (!citaExistente.getFechaHora().equals(datosActualizados.getFechaHora()) ||
                !citaExistente.getOdontologo().getId().equals(datosActualizados.getOdontologo().getId())) {

            validarDisponibilidad(datosActualizados); // Validamos los nuevos datos

            citaExistente.setFechaHora(datosActualizados.getFechaHora());
            citaExistente.setOdontologo(datosActualizados.getOdontologo());
        }

        // Actualizamos el estado (Ej: pasó a CANCELADA o ATENDIDA)
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

    // VER CITAS DE UN DÍA ESPECÍFICO
    public List<Cita> obtenerCitasPorDia(LocalDate fecha) {
        // Como la base de datos guarda Fecha y Hora, buscamos desde las 00:00 hasta las 23:59 de ese día
        LocalDateTime inicioDelDia = fecha.atStartOfDay();
        LocalDateTime finDelDia = fecha.atTime(LocalTime.MAX);

        return citaRepository.findByFechaHoraBetween(inicioDelDia, finDelDia);
    }

    // MÉTODO PRIVADO AYUDANTE (Reutilizable)
    private void validarDisponibilidad(Cita cita) {
        LocalDate fechaSolicitada = cita.getFechaHora().toLocalDate();
        LocalTime horaSolicitada = cita.getFechaHora().toLocalTime();
        Long idDoctor = cita.getOdontologo().getId();

        List<TurnoOdontologo> turnosDelDia = turnoRepository.findByOdontologoIdAndFecha(idDoctor, fechaSolicitada);

        if (turnosDelDia.isEmpty()) {
            throw new RuntimeException("El odontólogo no trabaja en la fecha seleccionada.");
        }

        boolean horaValida = false;
        for (TurnoOdontologo turno : turnosDelDia) {
            if (!horaSolicitada.isBefore(turno.getHoraInicio()) && horaSolicitada.isBefore(turno.getHoraFin())) {
                horaValida = true;
                break;
            }
        }

        if (!horaValida) {
            throw new RuntimeException("La hora seleccionada está fuera del horario de atención del doctor.");
        }

        boolean doctorOcupado = citaRepository.existsByOdontologoIdAndFechaHoraAndEstado(idDoctor, cita.getFechaHora(), EstadoCita.PENDIENTE);

        if (doctorOcupado) {
            throw new RuntimeException("El doctor ya tiene una cita reservada en ese horario exacto.");
        }
    }
}