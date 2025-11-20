package com.corhuila.egresados.application.jobs;

import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.domain.ports.JobOfferRepository;

import java.util.UUID;

public class AdminJobOfferService {
    private final JobOfferRepository repo;
    public AdminJobOfferService(JobOfferRepository repo) { this.repo = repo; }

    public JobOffer create(JobOffer job) {
        if (job.getId() == null) job.setId(UUID.randomUUID());
        if (job.getEstado() == null) job.setEstado(JobOffer.Estado.BORRADOR);
        // Validaciones básicas
        if (isBlank(job.getTitulo())) {
            throw new IllegalArgumentException("El título es obligatorio");
        }
        if (isBlank(job.getEmpresa())) {
            throw new IllegalArgumentException("La empresa es obligatoria");
        }
        return repo.save(job);
    }

    public JobOffer update(JobOffer job) {
        // Validaciones básicas
        if (isBlank(job.getTitulo())) {
            throw new IllegalArgumentException("El título es obligatorio");
        }
        if (isBlank(job.getEmpresa())) {
            throw new IllegalArgumentException("La empresa es obligatoria");
        }
        return repo.save(job);
    }

    public JobOffer publish(UUID id) {
        JobOffer job = repo.findById(id).orElseThrow();
        
        // Validar campos obligatorios
        if (isBlank(job.getTitulo())) {
            throw new IllegalArgumentException("RN-AE01: El título es obligatorio para publicar");
        }
        if (isBlank(job.getDescripcion())) {
            throw new IllegalArgumentException("RN-AE01: La descripción es obligatoria para publicar");
        }
        if (isBlank(job.getEmpresa())) {
            throw new IllegalArgumentException("RN-AE01: La empresa es obligatoria para publicar");
        }
        if (isBlank(job.getTipoContrato())) {
            throw new IllegalArgumentException("RN-AE01: El tipo de contrato es obligatorio para publicar");
        }
        if (isBlank(job.getCiudad())) {
            throw new IllegalArgumentException("RN-AE01: La ciudad es obligatoria para publicar");
        }
        if (isBlank(job.getModalidad())) {
            throw new IllegalArgumentException("RN-AE01: La modalidad es obligatoria para publicar");
        }
        if (job.getFechaInicioPublicacion() == null) {
            job.setFechaInicioPublicacion(java.time.OffsetDateTime.now());
        }
        if (job.getFechaFinPublicacion() == null) {
            throw new IllegalArgumentException("RN-AE01: La fecha de fin de publicación es obligatoria para publicar");
        }
        
        // Validar que la fecha de fin sea posterior a la de inicio
        if (job.getFechaFinPublicacion().isBefore(job.getFechaInicioPublicacion())) {
            throw new IllegalArgumentException("RN-AE01: La fecha de fin debe ser posterior a la fecha de inicio");
        }
        
        job.setEstado(JobOffer.Estado.PUBLICADA);
        return repo.save(job);
    }

    public JobOffer expire(UUID id) {
        JobOffer job = repo.findById(id).orElseThrow();
        job.setEstado(JobOffer.Estado.VENCIDA);
        return repo.save(job);
    }

    public JobOffer close(UUID id) {
        JobOffer job = repo.findById(id).orElseThrow();
        job.setEstado(JobOffer.Estado.VENCIDA);
        return repo.save(job);
    }

    public JobOffer archive(UUID id) {
        JobOffer job = repo.findById(id).orElseThrow();
        job.setEstado(JobOffer.Estado.ARCHIVADA);
        return repo.save(job);
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    public boolean isVencida(JobOffer j) { 
        return j.getFechaFinPublicacion() != null && 
               j.getFechaFinPublicacion().isBefore(java.time.OffsetDateTime.now()); 
    }

    private boolean isValidEmail(String s) { return s != null && s.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"); }
    private boolean isValidUrl(String s) { return s != null && s.matches("^(https?://).+$"); }
}
