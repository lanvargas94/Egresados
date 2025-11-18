package com.corhuila.egresados.infrastructure.catalog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cities", indexes = @Index(name = "idx_cities_country", columnList = "country_code"))
public class CityEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "country_code")
    private String countryCode;
    private String name;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

