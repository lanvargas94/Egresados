package com.corhuila.egresados.infrastructure.config;

import com.corhuila.egresados.application.events.AdminEventService;
import com.corhuila.egresados.application.events.EventRsvpService;
import com.corhuila.egresados.application.jobs.AdminJobOfferService;
import com.corhuila.egresados.domain.ports.EventRepository;
import com.corhuila.egresados.domain.ports.JobOfferRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminUseCaseConfig {
    @Bean
    public AdminJobOfferService adminJobOfferService(JobOfferRepository repo) { return new AdminJobOfferService(repo); }

    @Bean
    public AdminEventService adminEventService(EventRepository repo) { return new AdminEventService(repo); }

    @Bean
    public EventRsvpService eventRsvpService(EventRepository repo,
                                             com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventWaitlistJpaRepository waitlistRepo,
                                             com.corhuila.egresados.infrastructure.mail.EmailService email,
                                             com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository grads) {
        return new EventRsvpService(repo, waitlistRepo, email, grads);
    }

    @Bean
    public com.corhuila.egresados.application.admin.AdminReportsUseCase adminReportsUseCase(
            com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository graduateJpa,
            com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventJpaRepository eventJpa,
            com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventRsvpJpaRepository rsvpJpa) {
        return new com.corhuila.egresados.application.admin.AdminReportsUseCase(graduateJpa, eventJpa, rsvpJpa);
    }

    @Bean
    public com.corhuila.egresados.application.admin.ManageAdminUserUseCase manageAdminUserUseCase(
            com.corhuila.egresados.domain.ports.AdminUserRepository adminUserRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return new com.corhuila.egresados.application.admin.ManageAdminUserUseCase(adminUserRepository, passwordEncoder);
    }

    @Bean
    public com.corhuila.egresados.application.admin.ListGraduatesUseCase listGraduatesUseCase(
            com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository jpa) {
        return new com.corhuila.egresados.application.admin.ListGraduatesUseCase(jpa);
    }

    @Bean
    public com.corhuila.egresados.application.admin.UpdateGraduateUseCase updateGraduateUseCase(
            com.corhuila.egresados.domain.ports.GraduateRepository graduateRepository) {
        return new com.corhuila.egresados.application.admin.UpdateGraduateUseCase(graduateRepository);
    }

    @Bean
    public com.corhuila.egresados.application.admin.ChangeGraduateStatusUseCase changeGraduateStatusUseCase(
            com.corhuila.egresados.domain.ports.GraduateRepository graduateRepository) {
        return new com.corhuila.egresados.application.admin.ChangeGraduateStatusUseCase(graduateRepository);
    }
}
