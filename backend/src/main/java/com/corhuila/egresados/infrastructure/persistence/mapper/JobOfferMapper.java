package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.domain.model.JobInterest;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobOfferEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobInterestEntity;

public class JobOfferMapper {
    public static JobOffer toDomain(JobOfferEntity e) {
        JobOffer j = new JobOffer();
        j.setId(e.getId());
        j.setTitulo(e.getTitulo());
        j.setDescripcion(e.getDescripcion());
        j.setEmpresa(e.getEmpresa());
        j.setTipoContrato(e.getTipoContrato());
        j.setCiudad(e.getCiudad());
        j.setModalidad(e.getModalidad());
        j.setRangoSalarial(e.getRangoSalarial());
        j.setFechaInicioPublicacion(e.getFechaInicioPublicacion());
        j.setFechaFinPublicacion(e.getFechaFinPublicacion());
        j.setSector(e.getSector());
        j.setEstado(e.getEstado());
        return j;
    }

    public static void updateEntity(JobOffer j, JobOfferEntity e) {
        e.setId(j.getId());
        e.setTitulo(j.getTitulo());
        e.setDescripcion(j.getDescripcion());
        e.setEmpresa(j.getEmpresa());
        e.setTipoContrato(j.getTipoContrato());
        e.setCiudad(j.getCiudad());
        e.setModalidad(j.getModalidad());
        e.setRangoSalarial(j.getRangoSalarial());
        e.setFechaInicioPublicacion(j.getFechaInicioPublicacion());
        e.setFechaFinPublicacion(j.getFechaFinPublicacion());
        e.setSector(j.getSector());
        e.setEstado(j.getEstado());
    }

    public static JobInterest toDomain(JobInterestEntity e) {
        JobInterest j = new JobInterest();
        j.setId(e.getId());
        j.setJobOfferId(e.getJobOfferId());
        j.setGraduateId(e.getGraduateId());
        j.setCreatedAt(e.getCreatedAt());
        return j;
    }

    public static void updateEntity(JobInterest j, JobInterestEntity e) {
        e.setId(j.getId());
        e.setJobOfferId(j.getJobOfferId());
        e.setGraduateId(j.getGraduateId());
        e.setCreatedAt(j.getCreatedAt());
    }
}

