package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.models.TurnoOdontologo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TurnoOdontologoRepository extends JpaRepository<TurnoOdontologo, Long> {

    List<TurnoOdontologo> findByFecha(LocalDate fecha);
    List<TurnoOdontologo> findByOdontologoIdAndFecha(Long odontologoId, LocalDate fecha);
    List<TurnoOdontologo> findByOdontologoIdAndFechaGreaterThanEqualOrderByFechaAsc(Long odontologoId, LocalDate fecha);
    List<TurnoOdontologo> findByOdontologoIdAndFechaLessThanOrderByFechaDesc(Long odontologoId, LocalDate fecha);
}
