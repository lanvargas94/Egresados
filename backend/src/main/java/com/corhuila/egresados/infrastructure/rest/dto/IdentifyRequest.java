package com.corhuila.egresados.infrastructure.rest.dto;

import jakarta.validation.constraints.NotBlank;

public class IdentifyRequest {
    @NotBlank
    public String numeroIdentificacion;
}

