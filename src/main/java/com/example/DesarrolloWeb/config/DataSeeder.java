package com.example.DesarrolloWeb.config;

import com.example.DesarrolloWeb.enums.Especialidad;
import com.example.DesarrolloWeb.enums.EstadoCIta;
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

            System.out.println("🌱 Cargando datos de prueba masivos...");

            // ==========================================
            // 1. CREAR USUARIOS (Validación: Passwords de min 8 caracteres y Rol Enum)
            // ==========================================
            Usuario admin = new Usuario();
            admin.setGmail("admin@clinica.com");
            admin.setPassword("admin1234");
            admin.setRol(Rol.ADMIN); // Ajusta esto según el nombre exacto en tu Enum Rol

            Usuario odonto1User = new Usuario();
            odonto1User.setGmail("dr.smith@clinica.com");
            odonto1User.setPassword("odonto1234");
            odonto1User.setRol(Rol.ODONTOLOGO);

            Usuario pac1User = new Usuario();
            pac1User.setGmail("carlos@clinica.com");
            pac1User.setPassword("paciente1234");
            pac1User.setRol(Rol.PACIENTE);

            usuarioRepository.saveAll(List.of(admin, odonto1User, pac1User));

            // ==========================================
            // 2. CREAR ODONTÓLOGOS (Validación: Teléfono 9 dígitos que inicia con 9)
            // ==========================================
            Odontologo odonto1 = new Odontologo();
            odonto1.setNombre("John");
            odonto1.setApellido("Smith");
            odonto1.setTelefono("987654321");
            odonto1.setEspecialidad(Especialidad.GENERAL);
            odonto1.setUsuario(odonto1User); // Le asignamos la cuenta que creamos arriba

            odontologoRepository.save(odonto1);

            // ==========================================
            // 3. CREAR PACIENTES (Validación: DNI 8 dígitos)
            // ==========================================
            Paciente pac1 = new Paciente();
            pac1.setNombre("Carlos");
            pac1.setApellido("Gomez");
            pac1.setDni("11111111");
            pac1.setTelefono("999111222");
            pac1.setUsuario(pac1User); // Le asignamos su cuenta

            pacienteRepository.save(pac1);

            // ==========================================
            // 4. CREAR TURNOS (Validación: Fechas futuras o de hoy)
            // ==========================================
            TurnoOdontologo turnoHoy = new TurnoOdontologo();
            turnoHoy.setFecha(LocalDate.now()); // HOY
            turnoHoy.setHoraInicio(LocalTime.of(8, 0));
            turnoHoy.setHoraFin(LocalTime.of(18, 0));
            turnoHoy.setOdontologo(odonto1);

            TurnoOdontologo turnoManana = new TurnoOdontologo();
            turnoManana.setFecha(LocalDate.now().plusDays(1)); // MAÑANA
            turnoManana.setHoraInicio(LocalTime.of(8, 0));
            turnoManana.setHoraFin(LocalTime.of(18, 0));
            turnoManana.setOdontologo(odonto1);

            turnoRepository.saveAll(List.of(turnoHoy, turnoManana));

            // ==========================================
            // 5. CREAR CITAS (Validación: Estado Enum y Relación con Odontologo)
            // ==========================================
            Cita cita1 = new Cita();
            // Cita para HOY a las 10:00 (Cae dentro del turno de hoy)
            cita1.setFechaHora(LocalDateTime.of(LocalDate.now(), LocalTime.of(10, 0)));
            cita1.setEstado(EstadoCIta.PENDIENTE);
            cita1.setPaciente(pac1);
            cita1.setOdontologo(odonto1); // Pasamos la clase Odontologo (no el Usuario)

            Cita cita2 = new Cita();
            // Cita para MAÑANA a las 15:30
            cita2.setFechaHora(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(15, 30)));
            cita2.setEstado(EstadoCIta.ATENDIDA); // Usando Enum correcto
            cita2.setPaciente(pac1);
            cita2.setOdontologo(odonto1);

            citaRepository.saveAll(List.of(cita1, cita2));

            // ==========================================
            // 6. CREAR ODONTOGRAMAS (Validación: Diente del 11 al 85)
            // ==========================================
            Odontograma diente11 = new Odontograma();
            diente11.setNumeroDiente(11);
            diente11.setEstado("CARIES");
            diente11.setPaciente(pac1);

            Odontograma diente48 = new Odontograma();
            diente48.setNumeroDiente(48);
            diente48.setEstado("EXTRACCION");
            diente48.setPaciente(pac1);

            odontogramaRepository.saveAll(List.of(diente11, diente48));

            System.out.println("✅ ¡Datos masivos cargados con éxito usando @Bean y saveAll!");
        };
    }
}