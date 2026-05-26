package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.models.Cita;
import com.example.DesarrolloWeb.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    public Cita agendarCita(Cita nuevaCita) {
        return citaRepository.save(nuevaCita);
    }

    public List<Cita> obtenerCitasDelOdontologo(Long idOdontologo) {
        return citaRepository.findAll();
    }
}