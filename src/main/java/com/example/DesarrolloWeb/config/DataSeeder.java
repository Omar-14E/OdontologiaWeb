package com.example.DesarrolloWeb.config;

import com.example.DesarrolloWeb.enums.Especialidad;
import com.example.DesarrolloWeb.enums.EstadoCita;
import com.example.DesarrolloWeb.enums.Rol;
import com.example.DesarrolloWeb.models.*;
import com.example.DesarrolloWeb.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UsuarioRepository usuarioRepository,
            OdontologoRepository odontologoRepository,
            PacienteRepository pacienteRepository,
            TurnoOdontologoRepository turnoRepository,
            CitaRepository citaRepository,
            OdontogramaRepository odontogramaRepository) {

        return args -> {
            if (usuarioRepository.count() > 0) {
                System.out.println("⚡ La base de datos ya tiene información. Omitiendo la carga inicial.");
                return;
            }

            System.out.println("🌱 Cargando datos de prueba masivos (Fechas corregidas para el futuro)...");

            // ==========================================
            // 1. CREAR USUARIOS
            // ==========================================
            Usuario admin = new Usuario();
            admin.setGmail("admin@clinica.com");
            admin.setPassword("admin1234");
            admin.setRol(Rol.ADMIN);

            // Usuarios Doctores
            Usuario odonto1User = new Usuario();
            odonto1User.setGmail("dr.smith@clinica.com");
            odonto1User.setPassword("odonto1234");
            odonto1User.setRol(Rol.ODONTOLOGO);

            Usuario odonto2User = new Usuario();
            odonto2User.setGmail("dra.ana@clinica.com");
            odonto2User.setPassword("odonto5678");
            odonto2User.setRol(Rol.ODONTOLOGO);

            // Usuarios Pacientes
            Usuario pac1User = new Usuario();
            pac1User.setGmail("carlos@clinica.com");
            pac1User.setPassword("paciente1234");
            pac1User.setRol(Rol.PACIENTE);

            Usuario pac2User = new Usuario();
            pac2User.setGmail("maria@clinica.com");
            pac2User.setPassword("paciente5678");
            pac2User.setRol(Rol.PACIENTE);

            Usuario pac3User = new Usuario();
            pac3User.setGmail("luis@clinica.com");
            pac3User.setPassword("paciente9012");
            pac3User.setRol(Rol.PACIENTE);

            usuarioRepository.saveAll(List.of(admin, odonto1User, odonto2User, pac1User, pac2User, pac3User));

            // ==========================================
            // 2. CREAR ODONTÓLOGOS
            // ==========================================
            Odontologo odonto1 = new Odontologo();
            odonto1.setNombre("John");
            odonto1.setApellido("Smith");
            odonto1.setTelefono("987654321");
            odonto1.setEspecialidad(Especialidad.GENERAL);
            odonto1.setUsuario(odonto1User);

            Odontologo odonto2 = new Odontologo();
            odonto2.setNombre("Ana");
            odonto2.setApellido("Torres");
            odonto2.setTelefono("912345678");
            odonto2.setEspecialidad(Especialidad.ORTODONCIA);
            odonto2.setUsuario(odonto2User);

            odontologoRepository.saveAll(List.of(odonto1, odonto2));

            // ==========================================
            // 3. CREAR PACIENTES
            // ==========================================
            Paciente pac1 = new Paciente();
            pac1.setNombre("Carlos");
            pac1.setApellido("Gomez");
            pac1.setDni("11111111");
            pac1.setTelefono("999111222");
            pac1.setUsuario(pac1User);

            Paciente pac2 = new Paciente();
            pac2.setNombre("Maria");
            pac2.setApellido("Lopez");
            pac2.setDni("22222222");
            pac2.setTelefono("988222333");
            pac2.setUsuario(pac2User);

            Paciente pac3 = new Paciente();
            pac3.setNombre("Luis");
            pac3.setApellido("Perez");
            pac3.setDni("33333333");
            pac3.setTelefono("977333444");
            pac3.setUsuario(pac3User);

            pacienteRepository.saveAll(List.of(pac1, pac2, pac3));

            // ==========================================
            // 4. CREAR TURNOS (HACIA EL FUTURO)
            // ==========================================
            // Turnos Dr. Smith
            TurnoOdontologo turno1Smith = new TurnoOdontologo();
            turno1Smith.setFecha(LocalDate.now().plusDays(1)); // MAÑANA
            turno1Smith.setHoraInicio(LocalTime.of(8, 0));
            turno1Smith.setHoraFin(LocalTime.of(13, 0));
            turno1Smith.setOdontologo(odonto1);

            TurnoOdontologo turno2Smith = new TurnoOdontologo();
            turno2Smith.setFecha(LocalDate.now().plusDays(2)); // PASADO MAÑANA
            turno2Smith.setHoraInicio(LocalTime.of(14, 0));
            turno2Smith.setHoraFin(LocalTime.of(20, 0));
            turno2Smith.setOdontologo(odonto1);

            // Turnos Dra. Ana
            TurnoOdontologo turno1Ana = new TurnoOdontologo();
            turno1Ana.setFecha(LocalDate.now().plusDays(1)); // MAÑANA
            turno1Ana.setHoraInicio(LocalTime.of(9, 0));
            turno1Ana.setHoraFin(LocalTime.of(15, 0));
            turno1Ana.setOdontologo(odonto2);

            turnoRepository.saveAll(List.of(turno1Smith, turno2Smith, turno1Ana));

            // ==========================================
            // 5. CREAR CITAS (HACIA EL FUTURO)
            // ==========================================
            // Carlos con Dr. Smith (Mañana)
            Cita cita1 = new Cita();
            cita1.setFechaHora(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(10, 0)));
            cita1.setEstado(EstadoCita.ATENDIDA);
            cita1.setPaciente(pac1);
            cita1.setOdontologo(odonto1);

            // Maria con Dra. Ana (Mañana)
            Cita cita2 = new Cita();
            cita2.setFechaHora(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(11, 30)));
            cita2.setEstado(EstadoCita.PENDIENTE);
            cita2.setPaciente(pac2);
            cita2.setOdontologo(odonto2);

            // Luis con Dr. Smith (Pasado Mañana)
            Cita cita3 = new Cita();
            cita3.setFechaHora(LocalDateTime.of(LocalDate.now().plusDays(2), LocalTime.of(16, 0)));
            cita3.setEstado(EstadoCita.PENDIENTE);
            cita3.setPaciente(pac3);
            cita3.setOdontologo(odonto1);

            citaRepository.saveAll(List.of(cita1, cita2, cita3));

            // ==========================================
            // 6. CREAR ODONTOGRAMAS
            // ==========================================
            Odontograma c_diente11 = new Odontograma();
            c_diente11.setNumeroDiente(11);
            c_diente11.setEstado("CARIES");
            c_diente11.setPaciente(pac1);

            Odontograma c_diente48 = new Odontograma();
            c_diente48.setNumeroDiente(48);
            c_diente48.setEstado("EXTRACCION");
            c_diente48.setPaciente(pac1);

            Odontograma m_diente14 = new Odontograma();
            m_diente14.setNumeroDiente(14);
            m_diente14.setEstado("AMALGAMA");
            m_diente14.setPaciente(pac2);

            Odontograma m_diente22 = new Odontograma();
            m_diente22.setNumeroDiente(22);
            m_diente22.setEstado("SANO");
            m_diente22.setPaciente(pac2);

            Odontograma l_diente36 = new Odontograma();
            l_diente36.setNumeroDiente(36);
            l_diente36.setEstado("ENDODONCIA");
            l_diente36.setPaciente(pac3);

            odontogramaRepository.saveAll(List.of(c_diente11, c_diente48, m_diente14, m_diente22, l_diente36));

            System.out.println("¡Datos masivos cargados con éxito! Todo funcionando correctamente.");
        };
    }
}