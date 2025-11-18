package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobOfferEntity;

public class JobOfferMapper {
    public static JobOffer toDomain(JobOfferEntity e) {
        JobOffer j = new JobOffer();
        j.setId(e.getId());
        j.setTitulo(e.getTitulo());
        j.setEmpresa(e.getEmpresa());
        j.setSector(e.getSector());
        j.setFechaCierre(e.getFechaCierre());
        j.setTipoContrato(e.getTipoContrato());
        j.setEnlacePostulacion(e.getEnlacePostulacion());
        j.setResumen(e.getResumen());
        j.setEstado(e.getEstado());
        return j;
    }

    public static void updateEntity(JobOffer j, JobOfferEntity e) {
        e.setId(j.getId());
        e.setTitulo(j.getTitulo());
        e.setEmpresa(j.getEmpresa());
        e.setSector(j.getSector());
        e.setFechaCierre(j.getFechaCierre());
        e.setTipoContrato(j.getTipoContrato());
        e.setEnlacePostulacion(j.getEnlacePostulacion());
        e.setResumen(j.getResumen());
        e.setEstado(j.getEstado());
    }
}

