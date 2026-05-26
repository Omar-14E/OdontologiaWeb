package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.models.Odontograma;
import com.example.DesarrolloWeb.repository.OdontogramaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OdontogramaService {

    @Autowired
    private OdontogramaRepository odontogramaRepository;

    public List<Odontograma> obtenerPorPaciente(Long pacienteId) {
        return odontogramaRepository.findByPacienteId(pacienteId);
    }

    public Odontograma guardarRegistro(Odontograma registro) {
        return odontogramaRepository.save(registro);
    }
}