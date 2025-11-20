package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.model.Program;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.GraduateEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.ProgramEntity;

import java.util.ArrayList;
import java.util.List;

public class GraduateMapper {
    public static Graduate toDomain(GraduateEntity e) {
        if (e == null) return null;
        Graduate g = new Graduate();
        g.setId(e.getId());
        g.setIdInterno(e.getIdInterno());
        g.setIdentificacion(e.getIdentificacion());
        g.setNombreLegal(e.getNombreLegal());
        g.setCorreoPersonal(e.getCorreoPersonal());
        g.setPais(e.getPais());
        g.setCiudad(e.getCiudad());
        g.setTelefonoMovilE164(e.getTelefonoMovilE164());
        g.setSituacionLaboral(e.getSituacionLaboral());
        g.setIndustria(e.getIndustria());
        g.setEmpresa(e.getEmpresa());
        g.setCargo(e.getCargo());
        g.setAporteMentoria(e.getAporteMentoria());
        g.setAporteOfertas(e.getAporteOfertas());
        g.setAporteConferencista(e.getAporteConferencista());
        g.setIntNoticiasFacultad(e.getIntNoticiasFacultad());
        g.setIntEventosCiudad(e.getIntEventosCiudad());
        g.setIntOfertasSector(e.getIntOfertasSector());
        g.setIntPosgrados(e.getIntPosgrados());
        g.setCorreoVerificado(e.isCorreoVerificado());
        g.setConsentimientoDatos(e.isConsentimientoDatos());
        g.setOnboardingCompleto(e.isOnboardingCompleto());
        g.setEstado(e.getEstado());
        g.setObservacionesInternas(e.getObservacionesInternas());
        g.setCreadoEn(e.getCreadoEn());
        g.setActualizadoEn(e.getActualizadoEn());
        List<Program> programs = new ArrayList<>();
        if (e.getProgramas() != null) {
            for (ProgramEntity pe : e.getProgramas()) {
                programs.add(new Program(pe.getFacultad(), pe.getPrograma(), pe.getAnio()));
            }
        }
        g.setProgramas(programs);
        return g;
    }

    public static void updateEntity(Graduate g, GraduateEntity e) {
        e.setId(g.getId());
        e.setIdInterno(g.getIdInterno());
        e.setIdentificacion(g.getIdentificacion());
        e.setNombreLegal(g.getNombreLegal());
        e.setCorreoPersonal(g.getCorreoPersonal());
        e.setPais(g.getPais());
        e.setCiudad(g.getCiudad());
        e.setTelefonoMovilE164(g.getTelefonoMovilE164());
        e.setSituacionLaboral(g.getSituacionLaboral());
        e.setIndustria(g.getIndustria());
        e.setEmpresa(g.getEmpresa());
        e.setCargo(g.getCargo());
        e.setAporteMentoria(g.getAporteMentoria());
        e.setAporteOfertas(g.getAporteOfertas());
        e.setAporteConferencista(g.getAporteConferencista());
        e.setIntNoticiasFacultad(g.getIntNoticiasFacultad());
        e.setIntEventosCiudad(g.getIntEventosCiudad());
        e.setIntOfertasSector(g.getIntOfertasSector());
        e.setIntPosgrados(g.getIntPosgrados());
        e.setCorreoVerificado(g.isCorreoVerificado());
        e.setConsentimientoDatos(g.isConsentimientoDatos());
        e.setOnboardingCompleto(g.isOnboardingCompleto());
        e.setEstado(g.getEstado());
        e.setObservacionesInternas(g.getObservacionesInternas());
        e.setCreadoEn(g.getCreadoEn());
        e.setActualizadoEn(g.getActualizadoEn());

        // sincronizar programas
        e.getProgramas().clear();
        if (g.getProgramas() != null) {
            for (Program p : g.getProgramas()) {
                ProgramEntity pe = new ProgramEntity();
                pe.setFacultad(p.getFacultad());
                pe.setPrograma(p.getPrograma());
                pe.setAnio(p.getAnio());
                pe.setGraduate(e);
                e.getProgramas().add(pe);
            }
        }
    }
}
