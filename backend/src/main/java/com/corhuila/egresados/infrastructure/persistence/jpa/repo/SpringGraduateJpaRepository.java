package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.GraduateEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpringGraduateJpaRepository extends JpaRepository<GraduateEntity, UUID> {
    Optional<GraduateEntity> findByIdentificacion(String identificacion);

    @org.springframework.data.jpa.repository.Query("select g from GraduateEntity g left join fetch g.programas where g.id = :id")
    Optional<GraduateEntity> findWithProgramsById(UUID id);

    Optional<GraduateEntity> findByCorreoPersonalIgnoreCase(String correoPersonal);

    @org.springframework.data.jpa.repository.Query("select p.facultad as facultad, p.programa as programa, p.anio as anio, count(distinct g.id) as total " +
            "from GraduateEntity g join g.programas p " +
            "where (:facultad is null or p.facultad = :facultad) and (:programa is null or p.programa = :programa) and (:anio is null or p.anio = :anio) " +
            "group by p.facultad, p.programa, p.anio")
    java.util.List<Object[]> demografiaAggregate(String facultad, String programa, Integer anio);

    @org.springframework.data.jpa.repository.Query("select g.situacionLaboral as situacion, count(distinct g.id) as total from GraduateEntity g join g.programas p " +
            "where (:facultad is null or p.facultad = :facultad) and (:programa is null or p.programa = :programa) and (:anio is null or p.anio = :anio) " +
            "group by g.situacionLaboral")
    java.util.List<Object[]> empleabilidadAggregate(String facultad, String programa, Integer anio);

    @org.springframework.data.jpa.repository.Query(value = "select date_trunc('month', actualizado_en) as mes, count(*) from graduates where actualizado_en between :from and :to group by 1 order by 1", nativeQuery = true)
    java.util.List<Object[]> updatesByMonth(java.time.OffsetDateTime from, java.time.OffsetDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "select date_trunc('month', actualizado_en) as mes, count(*) from graduates where onboarding_completo = true and actualizado_en between :from and :to group by 1 order by 1", nativeQuery = true)
    java.util.List<Object[]> onboardingsByMonth(java.time.OffsetDateTime from, java.time.OffsetDateTime to);

    @org.springframework.data.jpa.repository.Query("select count(distinct g.id) from GraduateEntity g join g.programas p " +
            "where (:facultad is null or p.facultad = :facultad) and (:programa is null or p.programa = :programa) and (:anio is null or p.anio = :anio) " +
            "and (:pais is null or g.pais = :pais) and (:ciudad is null or g.ciudad = :ciudad) and (:sector is null or g.industria = :sector) and (:situacion is null or g.situacionLaboral = :situacion) " +
            "and (:from is null or g.actualizadoEn >= :from) and (:to is null or g.actualizadoEn <= :to)")
    long countFiltered(String facultad, String programa, Integer anio, String pais, String ciudad, String sector, com.corhuila.egresados.domain.model.EmploymentStatus situacion, java.time.OffsetDateTime from, java.time.OffsetDateTime to);

    @org.springframework.data.jpa.repository.Query("select distinct g from GraduateEntity g left join g.programas p " +
            "where (:facultad is null or p.facultad = :facultad) and (:programa is null or p.programa = :programa) and (:anio is null or p.anio = :anio) " +
            "and (:pais is null or g.pais = :pais) and (:ciudad is null or g.ciudad = :ciudad) and (:sector is null or g.industria = :sector) and (:situacion is null or g.situacionLaboral = :situacion) " +
            "and (:from is null or g.actualizadoEn >= :from) and (:to is null or g.actualizadoEn <= :to)")
    java.util.List<GraduateEntity> findFiltered(String facultad, String programa, Integer anio, String pais, String ciudad, String sector, com.corhuila.egresados.domain.model.EmploymentStatus situacion, java.time.OffsetDateTime from, java.time.OffsetDateTime to);
}
