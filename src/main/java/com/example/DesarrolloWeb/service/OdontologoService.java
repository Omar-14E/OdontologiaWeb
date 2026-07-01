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

import java.text.Normalizer;
import java.util.List;

@Service
public class OdontologoService {

    @Autowired
    private OdontologoRepository odontologoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional // Evita datos corruptos si hay un error a mitad del proceso
    public Odontologo guardarOdontologo(Odontologo odontologo) {

        if (odontologo.getUsuario() == null) {
            Usuario nuevoUsuario = new Usuario();

            String nombreLimpio = Normalizer.normalize(odontologo.getNombre(), Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "");
            String apellidoLimpio = Normalizer.normalize(odontologo.getApellido(), Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "");

            String nombreBase = nombreLimpio.toLowerCase().trim().replaceAll("\\s+", "");
            String apellidoBase = apellidoLimpio.toLowerCase().trim().replaceAll("\\s+", "");

            String baseUsername = "dr." + nombreBase + "." + apellidoBase;
            String usernameFinal = baseUsername;

            int contador = 1;
            while (usuarioRepository.findByUsername(usernameFinal).isPresent()) {
                usernameFinal = baseUsername + contador;
                contador++;
            }

            nuevoUsuario.setUsername(usernameFinal);
            nuevoUsuario.setGmail(usernameFinal + "@clinica.com");
            nuevoUsuario.setPassword(passwordEncoder.encode("odonto1234")); // Contraseña temporal por defecto
            nuevoUsuario.setRol(Rol.ODONTOLOGO);

            nuevoUsuario = usuarioRepository.save(nuevoUsuario);

            odontologo.setUsuario(nuevoUsuario);
        }

        return odontologoRepository.save(odontologo);
    }

    public Odontologo actualizarOdontologo(Long id, Odontologo datoNuevo) {
        Odontologo existente = odontologoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Odontologo no encontrado"));

        existente.setNombre(datoNuevo.getNombre());
        existente.setApellido(datoNuevo.getApellido());
        existente.setTelefono(datoNuevo.getTelefono());
        existente.setEspecialidad(datoNuevo.getEspecialidad());

        return odontologoRepository.save(existente);
    }

    public void eliminarOdontolodo(Long id) {
        if (!odontologoRepository.existsById(id)) {
            throw new RuntimeException("Odontólogo no encontrado para eliminar");
        }
        odontologoRepository.deleteById(id);
    }

    public List<Odontologo> obtenerTodos() {
        return odontologoRepository.findAll();
    }

    public Odontologo obtenerPorId(Long id) {
        return odontologoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Odontólogo no encontrado"));
    }

    public List<Odontologo> obtenerPorEspecialidad(Especialidad especialidad) {
        return odontologoRepository.findByEspecialidad(especialidad);
    }

    public Odontologo obtenerPorUsername(String username) {
        return odontologoRepository.findByUsuarioUsername(username)
                .orElseThrow(() -> new RuntimeException("Odontólogo no encontrado para el usuario: " + username));
    }
}