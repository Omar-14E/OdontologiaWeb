package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.enums.EstadoCita;
import com.example.DesarrolloWeb.models.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    //no se usa pero lo dejo porque pues lo pusisite tu
    List<Cita> findByOdontologoIdAndFechaHoraBetween(Long odontologoId, LocalDateTime inicio, LocalDateTime fin);

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
}