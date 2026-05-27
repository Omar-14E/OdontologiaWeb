package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.enums.Especialidad;
import com.example.DesarrolloWeb.models.Odontologo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OdontologoRepository extends JpaRepository<Odontologo, Long> {
    List<Odontologo> findByEspecialidad(Especialidad especialidad);

}
