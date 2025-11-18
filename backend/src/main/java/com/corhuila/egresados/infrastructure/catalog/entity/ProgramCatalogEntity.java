package com.corhuila.egresados.infrastructure.catalog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "programs_catalog")
public class ProgramCatalogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "faculty_name")
    private String facultyName;
    private String name;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

