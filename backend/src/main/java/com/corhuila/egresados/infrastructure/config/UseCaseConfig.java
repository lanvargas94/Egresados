package com.corhuila.egresados.infrastructure.config;

import com.corhuila.egresados.application.IdentifyGraduateUseCase;
import com.corhuila.egresados.application.onboarding.SaveOnboardingStep1UseCase;
import com.corhuila.egresados.application.onboarding.SaveOnboardingStep2UseCase;
import com.corhuila.egresados.application.onboarding.SaveOnboardingStep3UseCase;
import com.corhuila.egresados.domain.ports.CorhuilaPlusPort;
import com.corhuila.egresados.domain.ports.GraduateRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {
    @Bean
    public IdentifyGraduateUseCase identifyGraduateUseCase(GraduateRepository graduateRepository,
                                                           CorhuilaPlusPort corhuilaPlusPort) {
        return new IdentifyGraduateUseCase(graduateRepository, corhuilaPlusPort);
    }

    @Bean
    public SaveOnboardingStep1UseCase saveOnboardingStep1UseCase(GraduateRepository graduateRepository,
                                                                 com.corhuila.egresados.infrastructure.catalog.CatalogService catalogService) {
        return new SaveOnboardingStep1UseCase(graduateRepository, catalogService);
    }

    @Bean
    public SaveOnboardingStep2UseCase saveOnboardingStep2UseCase(GraduateRepository graduateRepository) {
        return new SaveOnboardingStep2UseCase(graduateRepository);
    }

    @Bean
    public SaveOnboardingStep3UseCase saveOnboardingStep3UseCase(GraduateRepository graduateRepository) {
        return new SaveOnboardingStep3UseCase(graduateRepository);
    }
}
