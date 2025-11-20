package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.infrastructure.audit.AuditLog;
import com.corhuila.egresados.infrastructure.audit.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit")
public class AdminAuditController {
    private final AuditLogRepository auditLogRepository;

    public AdminAuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) String action
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

            Specification<AuditLog> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                if (from != null && !from.isBlank()) {
                    try {
                        OffsetDateTime fromDate = OffsetDateTime.parse(from);
                        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
                    } catch (Exception e) {
                        // Ignorar formato inválido
                    }
                }

                if (to != null && !to.isBlank()) {
                    try {
                        OffsetDateTime toDate = OffsetDateTime.parse(to);
                        predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
                    } catch (Exception e) {
                        // Ignorar formato inválido
                    }
                }

                if (actor != null && !actor.isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("actor")), 
                        "%" + actor.toLowerCase() + "%"));
                }

                if (entity != null && !entity.isBlank()) {
                    predicates.add(cb.equal(cb.lower(root.get("entity")), 
                        entity.toLowerCase()));
                }

                if (action != null && !action.isBlank()) {
                    predicates.add(cb.equal(cb.upper(root.get("action")), 
                        action.toUpperCase()));
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            };

            Page<AuditLog> result = auditLogRepository.findAll(spec, pageable);

            List<Map<String, Object>> items = result.getContent().stream()
                    .map(log -> {
                        Map<String, Object> item = new java.util.HashMap<>();
                        item.put("id", log.getId());
                        item.put("actor", log.getActor() != null ? log.getActor() : "system");
                        item.put("action", log.getAction() != null ? log.getAction() : "");
                        item.put("entity", log.getEntity() != null ? log.getEntity() : "");
                        item.put("entityId", log.getEntityId() != null ? log.getEntityId() : "");
                        item.put("summary", log.getSummary() != null ? log.getSummary() : "");
                        item.put("createdAt", log.getCreatedAt() != null ? log.getCreatedAt().toString() : "");
                        return item;
                    })
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "items", items,
                    "total", result.getTotalElements(),
                    "page", page,
                    "size", size
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error al cargar registro de auditoría: " + ex.getMessage()));
        }
    }
}

