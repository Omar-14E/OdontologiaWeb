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

    //Adregar nuevo odonto
    public Odontologo guardarOdontologo(Odontologo odontologo){
        return odontologoRepository.save(odontologo);
    }

    //editar info del odontologo
    public Odontologo actualizarOdontologo (Long id, Odontologo datoNuevo){
        Odontologo existente = odontologoRepository.findById(id).orElseThrow(()-> new RuntimeException("Odontologo no encontrado"));

        existente.setNombre(datoNuevo.getNombre());
        existente.setApellido(datoNuevo.getApellido());
        existente.setTelefono(datoNuevo.getTelefono());
        existente.setEspecialidad(datoNuevo.getEspecialidad());

        return odontologoRepository.save(existente);
    }

    //despedir a un odontologo (eliminarlo)
    public void eliminarOdontolodo(Long id){
        odontologoRepository.deleteById(id);
    }

    //ver todos los odontologos que tenemos
    public List<Odontologo> obtenerTodos(){
        return odontologoRepository.findAll();
    }

    //ver odontologos por especialidad
    public List<Odontologo> obtenerPorEspecialidad(Especialidad especialidad){
        return odontologoRepository.findByEspecialidad(especialidad);
    }
}
