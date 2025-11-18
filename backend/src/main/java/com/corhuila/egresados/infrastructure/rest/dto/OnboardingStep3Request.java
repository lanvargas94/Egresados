package com.corhuila.egresados.infrastructure.rest.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class OnboardingStep3Request {
    @NotNull
    public UUID graduateId;
    public boolean consentimiento;
}

