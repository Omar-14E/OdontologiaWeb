package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.enums.EstadoCita;
import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    boolean existsByOdontologoIdAndFechaHoraAndEstado(Long odontologoId, LocalDateTime fechaHora, EstadoCita estado);

    List<Cita> findByPacienteId(Long pacienteId);

    List<Cita> findByOdontologoId(Long odontologoId);

    List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT COUNT(c) FROM Cita c WHERE DATE(c.fechaHora) = :fecha")
    long contarCitasDelDia(@Param("fecha") LocalDate fecha);

    List<Cita> findByOdontologoIdAndFechaHoraBetween(Long odontologoId, LocalDateTime inicio, LocalDateTime fin);

    long countByOdontologoIdAndFechaHoraBetween(Long odontologoId, LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT c FROM Cita c WHERE c.odontologo.usuario.username = :username ORDER BY c.fechaHora ASC")
    List<Cita> findCitasByOdontologoUsername(@Param("username") String username);

    @Query("SELECT DISTINCT c.paciente FROM Cita c WHERE c.odontologo.usuario.username = :username")
    List<Paciente> findPacientesByOdontologoUsername(@Param("username") String username);

    // Busca el historial clínico de un paciente específico atendido por el odontólogo logueado
    @Query("SELECT c FROM Cita c WHERE c.paciente.id = :pacienteId AND c.odontologo.usuario.username = :username ORDER BY c.fechaHora DESC")
    List<Cita> findHistorialClinicoPaciente(@Param("pacienteId") Long pacienteId, @Param("username") String username);
}

