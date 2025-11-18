package com.corhuila.egresados.application.jobs;

import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.domain.ports.JobOfferRepository;

import java.time.LocalDate;
import java.util.UUID;

public class AdminJobOfferService {
    private final JobOfferRepository repo;
    public AdminJobOfferService(JobOfferRepository repo) { this.repo = repo; }

    public JobOffer create(JobOffer job) {
        if (job.getId() == null) job.setId(UUID.randomUUID());
        if (job.getEstado() == null) job.setEstado(JobOffer.Estado.BORRADOR);
        return repo.save(job);
    }

    public JobOffer update(JobOffer job) {
        return repo.save(job);
    }

    public JobOffer publish(UUID id) {
        JobOffer job = repo.findById(id).orElseThrow();
        if (isBlank(job.getTitulo()) || isBlank(job.getEmpresa()) || isBlank(job.getSector()) ||
                job.getFechaCierre() == null || isBlank(job.getEnlacePostulacion())) {
            throw new IllegalArgumentException("RN-AE01: faltan campos obligatorios para publicar");
        }
        if (!isValidUrl(job.getEnlacePostulacion()) && !isValidEmail(job.getEnlacePostulacion())) {
            throw new IllegalArgumentException("RN-AE01: enlace de postulación debe ser URL o email válido");
        }
        job.setEstado(JobOffer.Estado.PUBLICADA);
        return repo.save(job);
    }

    public JobOffer archive(UUID id) {
        JobOffer job = repo.findById(id).orElseThrow();
        job.setEstado(JobOffer.Estado.ARCHIVADA);
        return repo.save(job);
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    public boolean isVencida(JobOffer j) { return j.getFechaCierre() != null && j.getFechaCierre().isBefore(LocalDate.now()); }

    private boolean isValidEmail(String s) { return s != null && s.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"); }
    private boolean isValidUrl(String s) { return s != null && s.matches("^(https?://).+$"); }
}
