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
        
        // Si desde Angular no nos envían un usuario, lo creamos automáticamente
        if (odontologo.getUsuario() == null) {
            Usuario nuevoUsuario = new Usuario();
            
            // 1. Limpiamos espacios y pasamos a minúsculas para el usuario
            String nombreBase = odontologo.getNombre().toLowerCase().trim().replaceAll("\\s+", "");
            String apellidoBase = odontologo.getApellido().toLowerCase().trim().replaceAll("\\s+", "");
            
            // 2. Generamos el formato base: dr.nombre.apellido
            String baseUsername = "dr." + nombreBase + "." + apellidoBase;
            String usernameFinal = baseUsername;
            
            // 3. Verificamos que el username no exista (si existe, le añadimos un número)
            int contador = 1;
            while (usuarioRepository.findByUsername(usernameFinal).isPresent()) {
                usernameFinal = baseUsername + contador;
                contador++;
            }
            
            // 4. Asignamos los datos al nuevo usuario
            nuevoUsuario.setUsername(usernameFinal);
            nuevoUsuario.setGmail(usernameFinal + "@clinica.com");
            nuevoUsuario.setPassword(passwordEncoder.encode("odonto1234")); // Contraseña temporal por defecto
            nuevoUsuario.setRol(Rol.ODONTOLOGO);
            
            // 5. Guardamos el usuario en la BD
            nuevoUsuario = usuarioRepository.save(nuevoUsuario);
            
            // 6. Vinculamos el usuario al médico
            odontologo.setUsuario(nuevoUsuario);
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