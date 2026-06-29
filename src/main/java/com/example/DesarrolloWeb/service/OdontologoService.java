package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.enums.Especialidad;
import com.example.DesarrolloWeb.enums.Rol;
import com.example.DesarrolloWeb.models.Odontologo;
import com.example.DesarrolloWeb.models.Usuario;
import com.example.DesarrolloWeb.repository.OdontologoRepository;
import com.example.DesarrolloWeb.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OdontologoService {

    @Autowired
    private OdontologoRepository odontologoRepository;

    // Inyectamos las herramientas para crear el usuario de forma segura
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional // Evita datos corruptos si hay un error a mitad del proceso
    public Odontologo guardarOdontologo(Odontologo odontologo) {
        
        // Extraer y procesar el Usuario (si viene en la petición JSON)
        if (odontologo.getUsuario() != null) {
            Usuario usuario = odontologo.getUsuario();
            
            // Validar que el username no exista ya en el sistema
            if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
                throw new RuntimeException("Error: El nombre de usuario ya está en uso");
            }
            
            // Encriptar contraseña y asignar el rol de ODONTOLOGO
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            usuario.setRol(Rol.ODONTOLOGO);
            
            // Guardar el usuario primero en la base de datos
            usuario = usuarioRepository.save(usuario);
            
            // Vincular el usuario recién creado al perfil del odontólogo
            odontologo.setUsuario(usuario);
        }

        return odontologoRepository.save(odontologo);
    }

    public Odontologo actualizarOdontologo (Long id, Odontologo datoNuevo){
        Odontologo existente = odontologoRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Odontologo no encontrado"));

        existente.setNombre(datoNuevo.getNombre());
        existente.setApellido(datoNuevo.getApellido());
        existente.setTelefono(datoNuevo.getTelefono());
        existente.setEspecialidad(datoNuevo.getEspecialidad());

        return odontologoRepository.save(existente);
    }

    public void eliminarOdontolodo(Long id){
        // Pequeña mejora: validamos que exista antes de intentar borrarlo
        if (!odontologoRepository.existsById(id)) {
            throw new RuntimeException("Odontólogo no encontrado para eliminar");
        }
        odontologoRepository.deleteById(id);
    }

    public List<Odontologo> obtenerTodos(){
        return odontologoRepository.findAll();
    }

    public Odontologo obtenerPorId(Long id) {
        return odontologoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Odontólogo no encontrado"));
    }

    public List<Odontologo> obtenerPorEspecialidad(Especialidad especialidad){
        return odontologoRepository.findByEspecialidad(especialidad);
    }

    public Odontologo obtenerPorUsername(String username) {
        return odontologoRepository.findByUsuarioUsername(username)
                .orElseThrow(() -> new RuntimeException("Odontólogo no encontrado para el usuario: " + username));
    }
}