package com.corhuila.egresados.infrastructure.catalog.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "faculties")
public class FacultyEntity {
    @Id
    private String name;
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

