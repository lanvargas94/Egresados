package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "programs")
public class ProgramEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String facultad;
    private String programa;
    private Integer anio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graduate_id")
    private GraduateEntity graduate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFacultad() { return facultad; }
    public void setFacultad(String facultad) { this.facultad = facultad; }
    public String getPrograma() { return programa; }
    public void setPrograma(String programa) { this.programa = programa; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public GraduateEntity getGraduate() { return graduate; }
    public void setGraduate(GraduateEntity graduate) { this.graduate = graduate; }
}

