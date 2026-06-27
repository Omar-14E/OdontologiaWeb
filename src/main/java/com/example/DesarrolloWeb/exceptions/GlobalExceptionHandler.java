package com.example.DesarrolloWeb.exceptions;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Atrapa tus errores manuales (Ej: "El DNI ya existe" o "Cita cruzada")
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // 2. Atrapa los errores de las anotaciones (@FutureOrPresent, @NotBlank, etc.)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(ConstraintViolationException ex) {
        Map<String, String> response = new HashMap<>();
        
        // Extraemos solo el mensaje limpio que tú escribiste ("No puedes programar...")
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            response.put("error", violation.getMessage());
            break; // Solo mostramos el primer error para no saturar al usuario
        }
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}