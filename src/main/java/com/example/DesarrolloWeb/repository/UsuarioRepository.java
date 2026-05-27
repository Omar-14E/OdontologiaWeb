package com.example.DesarrolloWeb.repository;

import com.example.DesarrolloWeb.enums.Rol;
import com.example.DesarrolloWeb.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    List<Usuario> findByRol(Rol rol);
    Optional<Usuario> findByUsername(String username);
}