package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.models.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByOdontologoIdAndFechaHoraBetween(Long odontologoId, LocalDateTime inicio, LocalDateTime fin);
}