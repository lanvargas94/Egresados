package com.corhuila.egresados.infrastructure.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class AuditService {
    private final AuditLogRepository repo;
    private final HttpServletRequest request;

    public AuditService(AuditLogRepository repo, HttpServletRequest request) {
        this.repo = repo; this.request = request;
    }

    public void log(String action, String entity, String entityId, String summary) {
        String actor = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
        if (actor == null || actor.isBlank()) actor = "system";
        AuditLog l = new AuditLog();
        l.setActor(actor);
        l.setAction(action);
        l.setEntity(entity);
        l.setEntityId(entityId);
        l.setSummary(summary);
        l.setCreatedAt(OffsetDateTime.now());
        repo.save(l);
    }
}
