package com.corhuila.egresados.domain.model;

public class Program {
    private String facultad;
    private String programa;
    private Integer anio;

    public Program() {}

    public Program(String facultad, String programa, Integer anio) {
        this.facultad = facultad;
        this.programa = programa;
        this.anio = anio;
    }

    public String getFacultad() { return facultad; }
    public void setFacultad(String facultad) { this.facultad = facultad; }

    public String getPrograma() { return programa; }
    public void setPrograma(String programa) { this.programa = programa; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
}

