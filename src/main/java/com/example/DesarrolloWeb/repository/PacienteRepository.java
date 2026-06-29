package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.models.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByDni(String dni);

    @Query("SELECT DISTINCT c.paciente FROM Cita c WHERE c.odontologo.usuario.username = :username")
    List<Paciente> findPacientesByOdontologoUsername(@Param("username") String username);

}