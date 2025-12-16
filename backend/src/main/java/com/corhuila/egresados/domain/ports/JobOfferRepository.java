package com.corhuila.egresados.domain.ports;

import com.corhuila.egresados.domain.model.JobOffer;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobOfferRepository {
    JobOffer save(JobOffer job);
    Optional<JobOffer> findById(UUID id);
    List<JobOffer> findPublicadasVigentes(LocalDate hoy);
    List<JobOffer> findPublicadasVigentes(LocalDate hoy, String sector, String empresa, String tipoContrato);
    List<JobOffer> findToExpire(LocalDate hoy);
    com.corhuila.egresados.domain.util.PageResult<JobOffer> findPublicadas(LocalDate hoy, String sector, String empresa, String tipoContrato, LocalDate fromDate, LocalDate toDate, int page, int size, String sort);
    com.corhuila.egresados.domain.util.PageResult<JobOffer> adminList(String estado, int page, int size);
    com.corhuila.egresados.domain.util.PageResult<JobOffer> findForGraduates(String estado, String sector, String empresa, String tipoContrato, String search, LocalDate fromDate, LocalDate toDate, int page, int size, String sort);
    Optional<JobOffer> findByIdForGraduate(UUID id);
    void delete(UUID id);
}
