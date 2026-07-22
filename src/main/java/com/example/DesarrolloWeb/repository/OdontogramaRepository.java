package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.models.Odontograma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; 

@Repository
public interface OdontogramaRepository extends JpaRepository<Odontograma, Long> {
    List<Odontograma> findByPacienteId(Long pacienteId);
}