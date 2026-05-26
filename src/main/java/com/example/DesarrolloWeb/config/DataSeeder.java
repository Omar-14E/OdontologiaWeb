package com.example.DesarrolloWeb.config;

import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.models.Odontograma;
import com.example.DesarrolloWeb.models.Paciente;
import com.example.DesarrolloWeb.models.Usuario;
import com.example.DesarrolloWeb.repository.CitaRepository;
import com.example.DesarrolloWeb.repository.OdontogramaRepository;
import com.example.DesarrolloWeb.repository.PacienteRepository;
import com.example.DesarrolloWeb.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UsuarioRepository usuarioRepository,
            PacienteRepository pacienteRepository,
            CitaRepository citaRepository,
            OdontogramaRepository odontogramaRepository) {

        return args -> {
            if (usuarioRepository.count() > 0) {
                System.out.println("La base de datos ya tiene información. Omitiendo la carga inicial.");
                return;
            }

            System.out.println("Cargando datos de prueba masivos...");

            Usuario admin = new Usuario();
            admin.setGmail("admin@clinica.com");
            admin.setPassword("1234");
            admin.setRol("ADMIN");

            Usuario odonto1 = new Usuario();
            odonto1.setGmail("dr.smith@clinica.com");
            odonto1.setPassword("1234");
            odonto1.setRol("ODONTOLOGO");

            Usuario odonto2 = new Usuario();
            odonto2.setGmail("dra.garcia@clinica.com");
            odonto2.setPassword("1234");
            odonto2.setRol("ODONTOLOGO");

            usuarioRepository.saveAll(List.of(admin, odonto1, odonto2));

            // CREAR PACIENTES

            Paciente pac1 = new Paciente();
            pac1.setNombre("Carlos");
            pac1.setApellido("Gomez");
            pac1.setDni("11111111");
            pac1.setTelefono("999111222");

            Paciente pac2 = new Paciente();
            pac2.setNombre("Maria");
            pac2.setApellido("Lopez");
            pac2.setDni("22222222");
            pac2.setTelefono("999333444");

            Paciente pac3 = new Paciente();
            pac3.setNombre("Fernando");
            pac3.setApellido("Torres");
            pac3.setDni("33333333");
            pac3.setTelefono("999555666");

            Paciente pac4 = new Paciente();
            pac4.setNombre("Lucia");
            pac4.setApellido("Mendez");
            pac4.setDni("44444444");
            pac4.setTelefono("999777888");

            pacienteRepository.saveAll(List.of(pac1, pac2, pac3, pac4));

            // CREAR CITAS
            Cita cita1 = new Cita();
            cita1.setFechaHora(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
            cita1.setEstado("PENDIENTE");
            cita1.setPaciente(pac1);
            cita1.setOdontologo(odonto1);

            Cita cita2 = new Cita();
            cita2.setFechaHora(LocalDateTime.now().plusDays(1).withHour(11).withMinute(30));
            cita2.setEstado("CONFIRMADA");
            cita2.setPaciente(pac2);
            cita2.setOdontologo(odonto1);

            Cita cita3 = new Cita();
            cita3.setFechaHora(LocalDateTime.now().plusDays(2).withHour(9).withMinute(0));
            cita3.setEstado("ATENDIDA");
            cita3.setPaciente(pac3);
            cita3.setOdontologo(odonto2);

            Cita cita4 = new Cita();
            cita4.setFechaHora(LocalDateTime.now().plusDays(3).withHour(15).withMinute(0));
            cita4.setEstado("PENDIENTE");
            cita4.setPaciente(pac4);
            cita4.setOdontologo(odonto2);

            Cita cita5 = new Cita();
            cita5.setFechaHora(LocalDateTime.now().plusDays(3).withHour(16).withMinute(0));
            cita5.setEstado("CANCELADA");
            cita5.setPaciente(pac1);
            cita5.setOdontologo(odonto2);

            citaRepository.saveAll(List.of(cita1, cita2, cita3, cita4, cita5));

            // CREAR ODONTOGRAMA DE PRUEBA
            Odontograma diente11 = new Odontograma();
            diente11.setNumeroDiente(11);
            diente11.setEstado("CARIES");
            diente11.setPaciente(pac1);

            Odontograma diente48 = new Odontograma();
            diente48.setNumeroDiente(48);
            diente48.setEstado("EXTRACCION");
            diente48.setPaciente(pac1);

            odontogramaRepository.saveAll(List.of(diente11, diente48));

            System.out.println("Datos masivos cargados con éxito!");
        };
    }
}