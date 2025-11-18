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
}
