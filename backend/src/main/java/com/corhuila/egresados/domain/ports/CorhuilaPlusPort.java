package com.corhuila.egresados.domain.ports;

import com.corhuila.egresados.domain.model.Program;

import java.util.List;
import java.util.Optional;

public interface CorhuilaPlusPort {
    class PersonaResult {
        public String idInterno;
        public String nombreLegal;
        public List<Program> programas;
        public String estadoAlumno;
    }

    Optional<PersonaResult> buscarPorIdentificacion(String identificacion);
}

