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

    // NUEVO: Buscar por Paciente
    List<Cita> findByPacienteId(Long pacienteId);

    // NUEVO: Buscar por Odontólogo
    List<Cita> findByOdontologoId(Long odontologoId);

    // NUEVO: Buscar citas en un rango de horas (Ej: todo un día)
    List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    // CONSULTA JPQL: Contar las citas de una fecha específica
    @Query("SELECT COUNT(c) FROM Cita c WHERE DATE(c.fechaHora) = :fecha")
    long contarCitasDelDia(@Param("fecha") LocalDate fecha);

    // NUEVO: Buscar citas de un médico específico en un rango de fechas
    List<Cita> findByOdontologoIdAndFechaHoraBetween(Long odontologoId, LocalDateTime inicio, LocalDateTime fin);

    // NUEVO: Contar citas de un médico específico en un rango de fechas
    long countByOdontologoIdAndFechaHoraBetween(Long odontologoId, LocalDateTime inicio, LocalDateTime fin);

    // 1. JPQL para obtener las citas de un médico específico por su username
    @Query("SELECT c FROM Cita c WHERE c.odontologo.usuario.username = :username ORDER BY c.fechaHora ASC")
    List<Cita> findCitasByOdontologoUsername(@Param("username") String username);

    // 2. JPQL para obtener los pacientes únicos asignados a un médico
    @Query("SELECT DISTINCT c.paciente FROM Cita c WHERE c.odontologo.usuario.username = :username")
    List<Paciente> findPacientesByOdontologoUsername(@Param("username") String username);
}

