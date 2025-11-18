package com.corhuila.egresados.infrastructure.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class OnboardingStep1Request {
    @NotBlank
    public UUID graduateId;
    @Email
    @NotBlank
    public String correoPersonal;
    @NotBlank
    public String pais;
    @NotBlank
    public String ciudad;
    public String telefonoMovil;
}

