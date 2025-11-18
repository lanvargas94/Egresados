package com.corhuila.egresados.infrastructure.rest.dto;

import com.corhuila.egresados.domain.model.EmploymentStatus;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class OnboardingStep2Request {
    @NotNull
    public UUID graduateId;
    @NotNull
    public EmploymentStatus situacionLaboral;
    public String industria;
    public String empresa;
    public String cargo;
}

