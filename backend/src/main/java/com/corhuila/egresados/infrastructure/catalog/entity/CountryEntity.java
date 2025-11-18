package com.corhuila.egresados.infrastructure.catalog.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "countries")
public class CountryEntity {
    @Id
    private String code; // ISO alpha-2
    private String name;
    @jakarta.persistence.Column(name = "dial_code")
    private String dialCode; // E.164 prefix e.g. +57

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDialCode() { return dialCode; }
    public void setDialCode(String dialCode) { this.dialCode = dialCode; }
}
