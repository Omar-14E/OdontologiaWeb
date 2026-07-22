package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.enums.EstadoCita;
import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.TurnoOdontologo;
import com.example.DesarrolloWeb.repository.CitaRepository;
import com.example.DesarrolloWeb.repository.TurnoOdontologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private TurnoOdontologoRepository turnoRepository;

    // CREAR CITA
    @Transactional
    public Cita crearCita(Cita nuevaCita) {

        if (nuevaCita.getFechaHora() != null && nuevaCita.getFechaHora().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("No puedes programar una cita en el pasado");
        }

        validarDisponibilidad(nuevaCita);
        return citaRepository.save(nuevaCita);
    }

    // EDITAR CITA
    @Transactional
    public Cita editarCita(Long id, Cita datosActualizados) {
        Cita citaExistente = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if ((datosActualizados.getFechaHora() != null
                && !citaExistente.getFechaHora().equals(datosActualizados.getFechaHora())) ||
                (datosActualizados.getOdontologo() != null && datosActualizados.getOdontologo().getId() != null &&
                        !citaExistente.getOdontologo().getId().equals(datosActualizados.getOdontologo().getId()))) {

            if (datosActualizados.getFechaHora().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("No puedes reprogramar una cita al pasado");
            }

            validarDisponibilidad(datosActualizados);

            citaExistente.setFechaHora(datosActualizados.getFechaHora());
            citaExistente.setOdontologo(datosActualizados.getOdontologo());
        }

        if (datosActualizados.getEstado() != null) {
            citaExistente.setEstado(datosActualizados.getEstado());
        }

        citaExistente.setObservaciones(datosActualizados.getObservaciones());

        return citaRepository.save(citaExistente);
    }

    @Transactional
    public void eliminarCita(Long id) {
        citaRepository.deleteById(id);
    }

    public List<Cita> obtenerCitasPorPaciente(Long pacienteId) {
        return citaRepository.findByPacienteId(pacienteId);
    }

    public List<Cita> obtenerCitasPorOdontologo(Long odontologoId) {
        return citaRepository.findByOdontologoId(odontologoId);
    }

    public List<Cita> obtenerCitasPorDia(LocalDate fecha) {
        LocalDateTime inicioDelDia = fecha.atStartOfDay();
        LocalDateTime finDelDia = fecha.atTime(LocalTime.MAX);

        return citaRepository.findByFechaHoraBetween(inicioDelDia, finDelDia);
    }

    // VER TODAS LAS CITAS
    public List<Cita> obtenerTodas() {
        return citaRepository.findAll();
    }

    // MÉTODO PRIVADO AYUDANTE
    private void validarDisponibilidad(Cita cita) {

        if (cita.getOdontologo() == null || cita.getOdontologo().getId() == null) {
            throw new RuntimeException("Error: La cita debe tener un odontólogo asignado.");
        }

        Long idDoctor = cita.getOdontologo().getId();
        LocalDateTime fechaHoraSolicitada = cita.getFechaHora();
        LocalDate fechaSolicitada = fechaHoraSolicitada.toLocalDate();
        LocalTime horaSolicitada = fechaHoraSolicitada.toLocalTime();

        List<TurnoOdontologo> turnos = turnoRepository.findByOdontologoIdAndFecha(idDoctor, fechaSolicitada);
        List<TurnoOdontologo> turnosAyer = turnoRepository.findByOdontologoIdAndFecha(idDoctor,
                fechaSolicitada.minusDays(1));

        turnos.addAll(turnosAyer);

        if (turnos.isEmpty()) {
            throw new RuntimeException("El doctor no tiene turnos programados cercanos a esta fecha.");
        }

        boolean horaValida = false;

        for (TurnoOdontologo turno : turnos) {
            LocalTime inicio = turno.getHoraInicio();
            LocalTime fin = turno.getHoraFin();
            LocalDate fechaTurno = turno.getFecha();

            if (inicio.isBefore(fin)) {
                if (fechaTurno.equals(fechaSolicitada) &&
                        !horaSolicitada.isBefore(inicio) &&
                        !horaSolicitada.isAfter(fin)) {
                    horaValida = true;
                    break;
                }
            } else {
                if (fechaTurno.equals(fechaSolicitada)) {
                    if (!horaSolicitada.isBefore(inicio)) {
                        horaValida = true;
                        break;
                    }
                } else if (fechaTurno.equals(fechaSolicitada.minusDays(1))) {
                    if (!horaSolicitada.isAfter(fin)) {
                        horaValida = true;
                        break;
                    }
                }
            }
        }

        if (!horaValida) {
            throw new RuntimeException(
                    "La hora seleccionada (" + horaSolicitada + ") está fuera del horario de atención del doctor.");
        }

        boolean doctorOcupado = citaRepository.existsByOdontologoIdAndFechaHoraAndEstado(
                idDoctor,
                fechaHoraSolicitada,
                EstadoCita.PENDIENTE);

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

    @Transactional
    @Scheduled(fixedRate = 300000)
    public void marcarCitasPasadasComoRealizadas() {

        LocalDateTime haceDosHoras = LocalDateTime.now().minusHours(2);

        List<Cita> citasVencidas = citaRepository.findByEstadoAndFechaHoraBefore(EstadoCita.PENDIENTE, haceDosHoras);

        if (!citasVencidas.isEmpty()) {

            for (Cita cita : citasVencidas) {
                cita.setEstado(EstadoCita.ATENDIDA);
            }

            citaRepository.saveAll(citasVencidas);
            System.out.println("Automatización: Se cambiaron a ATENDIDA " + citasVencidas.size()
                    + " citas pasadas hace más de 2 horas.");
        }
    }

    public List<String> obtenerHorariosDisponibles(Long odontologoId, LocalDate fecha) {

        List<TurnoOdontologo> turnos = turnoRepository.findByOdontologoIdAndFecha(odontologoId, fecha);

        if (turnos.isEmpty()) {
            return new ArrayList<>(); // El doctor no trabaja ese día
        }

        LocalDateTime inicioDia = fecha.atStartOfDay();
        LocalDateTime finDia = fecha.atTime(LocalTime.MAX);
        List<Cita> citasDelDia = citaRepository.findByOdontologoIdAndFechaHoraBetween(odontologoId, inicioDia, finDia);

        Set<LocalTime> horasOcupadas = citasDelDia.stream()
                .map(cita -> cita.getFechaHora().toLocalTime())
                .collect(Collectors.toSet());

        List<String> horariosDisponibles = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        for (TurnoOdontologo turno : turnos) {
            LocalTime horaActual = turno.getHoraInicio();
            LocalTime horaFin = turno.getHoraFin();

            long minutosTotales;
            if (horaActual.isBefore(horaFin)) {
                minutosTotales = java.time.Duration.between(horaActual, horaFin).toMinutes();
            } else {
                minutosTotales = (24 * 60) - (horaActual.getHour() * 60 + horaActual.getMinute()) +
                        (horaFin.getHour() * 60 + horaFin.getMinute());
            }

            long minutosRecorridos = 0;

            while (minutosRecorridos < minutosTotales) {

                boolean estaOcupada = horasOcupadas.contains(horaActual);
                boolean esHoy = fecha.isEqual(LocalDate.now());

                boolean esMadrugadaDelDiaSiguiente = horaActual.isBefore(turno.getHoraInicio());

                boolean yaPaso = false;
                if (esHoy && !esMadrugadaDelDiaSiguiente) {
                    yaPaso = horaActual.isBefore(LocalTime.now());
                }

                if (!estaOcupada && !yaPaso) {
                    horariosDisponibles.add(horaActual.format(formatter));
                }

                horaActual = horaActual.plusMinutes(60);
                minutosRecorridos += 60;
            }
        }

        return horariosDisponibles;
    }
}