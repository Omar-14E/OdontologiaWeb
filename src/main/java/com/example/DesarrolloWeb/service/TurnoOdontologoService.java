package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.models.Odontologo;
import com.example.DesarrolloWeb.models.TurnoOdontologo;
import com.example.DesarrolloWeb.repository.OdontologoRepository;
import com.example.DesarrolloWeb.repository.TurnoOdontologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TurnoOdontologoService {

    @Autowired
    private TurnoOdontologoRepository turnoOdontologoRepository;

    @Autowired
    private OdontologoRepository odontologoRepository;

    //Asignar fechas a un odontologo
    public TurnoOdontologo crearTurnoParaDoctor (Long odontologoId, TurnoOdontologo nuevoTurno){
        Odontologo odontologo = odontologoRepository.findById(odontologoId).orElseThrow(()-> new RuntimeException("Odontologo no encontrado"));

        nuevoTurno.setOdontologo(odontologo);
        return turnoOdontologoRepository.save(nuevoTurno);
    }

    //Eliminar turnos
    public void eliminarTurno(Long turnoId){
        turnoOdontologoRepository.deleteById(turnoId);
    }

    //Ca,biar turnos
    public TurnoOdontologo moverTurno(Long turnoId, TurnoOdontologo datoNuevo){
        TurnoOdontologo turnoExistente = turnoOdontologoRepository.findById(turnoId).orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turnoExistente.setFecha(datoNuevo.getFecha());
        turnoExistente.setHoraInicio(datoNuevo.getHoraInicio());
        turnoExistente.setHoraFin(datoNuevo.getHoraFin());
        return turnoOdontologoRepository.save(turnoExistente);
    }

    //Ver Odontologos segun la fecha
    public List<TurnoOdontologo> obtenerDisponibilidadPorFecha(LocalDate fecha){
        return turnoOdontologoRepository.findByFecha(fecha);
    }

    //Ver turnos de hoy en adelante de un odontologo
    public List<TurnoOdontologo> obtenerTurnosVigentes(Long odontologoId) {
        LocalDate hoy = LocalDate.now();
        return turnoOdontologoRepository.findByOdontologoIdAndFechaGreaterThanEqualOrderByFechaAsc(odontologoId, hoy);
    }

    //Ver turno que ya pasaronde un odontologo
    public List<TurnoOdontologo> obtenerHistorialTurnos(Long odontologoId) {
        LocalDate hoy = LocalDate.now();
        return turnoOdontologoRepository.findByOdontologoIdAndFechaLessThanOrderByFechaDesc(odontologoId, hoy);
    }

}
