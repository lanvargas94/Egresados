package com.corhuila.egresados.infrastructure.scheduling;

import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.domain.ports.EventRepository;
import com.corhuila.egresados.domain.ports.JobOfferRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Component
public class AutoStatusScheduler {
    private final JobOfferRepository jobs;
    private final EventRepository events;
    private final com.corhuila.egresados.domain.ports.NewsRepository news;

    public AutoStatusScheduler(JobOfferRepository jobs, EventRepository events, com.corhuila.egresados.domain.ports.NewsRepository news) {
        this.jobs = jobs; this.events = events; this.news = news;
    }

    // Corre cada hora
    @Scheduled(cron = "0 0 * * * *")
    public void expireJobs() {
        var toExpire = jobs.findToExpire(LocalDate.now());
        for (var j : toExpire) {
            if (j.getEstado() == JobOffer.Estado.PUBLICADA) {
                j.setEstado(JobOffer.Estado.VENCIDA);
                jobs.save(j);
            }
        }
    }

    // Corre cada 10 minutos
    @Scheduled(cron = "0 */10 * * * *")
    public void finalizeEvents() {
        var toFinalize = events.findToFinalize(OffsetDateTime.now());
        for (var e : toFinalize) {
            if (e.getEstado() == Event.Estado.PUBLICADA && e.getFechaHora() != null && e.getFechaHora().isBefore(OffsetDateTime.now())) {
                e.setEstado(Event.Estado.FINALIZADA); events.save(e);
            }
        }
    }

    // Corre cada minuto para autopublicar noticias programadas (RN-AN02)
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 * * * * *")
    public void autoPublishNews() {
        var list = news.findToAutoPublish(OffsetDateTime.now());
        for (var n : list) {
            n.setEstado(com.corhuila.egresados.domain.model.News.Status.PUBLICADA);
            news.save(n);
        }
    }
}
