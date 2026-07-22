package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.enums.Especialidad;
import com.example.DesarrolloWeb.models.Odontologo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OdontologoRepository extends JpaRepository<Odontologo, Long> {
    List<Odontologo> findByEspecialidad(Especialidad especialidad);

    @Query("SELECT o FROM Odontologo o WHERE o.especialidad = :especialidad")
    List<Odontologo> buscarPorEspecialidadJpql(@Param("especialidad") Especialidad especialidad);

    Optional<Odontologo> findByUsuarioUsername(String username);

}
