package com.example.DesarrolloWeb.service;

import com.example.DesarrolloWeb.enums.Especialidad;
import com.example.DesarrolloWeb.models.Odontologo;
import com.example.DesarrolloWeb.repository.OdontologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OdontologoService {
    @Autowired
    private OdontologoRepository odontologoRepository;

    public Odontologo guardarOdontologo(Odontologo odontologo){
        return odontologoRepository.save(odontologo);
    }

    public Odontologo actualizarOdontologo (Long id, Odontologo datoNuevo){
        Odontologo existente = odontologoRepository.findById(id).orElseThrow(()-> new RuntimeException("Odontologo no encontrado"));

        existente.setNombre(datoNuevo.getNombre());
        existente.setApellido(datoNuevo.getApellido());
        existente.setTelefono(datoNuevo.getTelefono());
        existente.setEspecialidad(datoNuevo.getEspecialidad());

        return odontologoRepository.save(existente);
    }

    public void eliminarOdontolodo(Long id){
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
}