package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.model.EmploymentStatus;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {
    private final SpringGraduateJpaRepository grads;

    public AdminAnalyticsController(SpringGraduateJpaRepository grads) { this.grads = grads; }

    @GetMapping("/demografia")
    public ResponseEntity<?> demografia(@RequestParam(required = false) String facultad,
                                        @RequestParam(required = false) String programa,
                                        @RequestParam(required = false) Integer anio) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object[] r : grads.demografiaAggregate(facultad, programa, anio)) {
            Map<String, Object> m = new HashMap<>();
            m.put("facultad", r[0]); m.put("programa", r[1]); m.put("anio", r[2]); m.put("total", r[3]);
            rows.add(m);
        }
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/empleabilidad")
    public ResponseEntity<?> empleabilidad(@RequestParam(required = false) String facultad,
                                           @RequestParam(required = false) String programa,
                                           @RequestParam(required = false) Integer anio) {
        long total = grads.countFiltered(facultad, programa, anio, null, null, null, null, null, null);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total", total);
        Map<String, Double> porcentajes = new LinkedHashMap<>();
        for (Object[] r : grads.empleabilidadAggregate(facultad, programa, anio)) {
            Object status = r[0]; long c = ((Number) r[1]).longValue();
            double pct = total == 0 ? 0.0 : (c * 100.0 / total);
            porcentajes.put(String.valueOf(status), Math.round(pct * 10.0)/10.0);
        }
        out.put("porcentajes", porcentajes);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/adopcion")
    public ResponseEntity<?> adopcion(@RequestParam(required = false) String from,
                                      @RequestParam(required = false) String to) {
        OffsetDateTime end = to != null ? OffsetDateTime.parse(to) : OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime start = from != null ? OffsetDateTime.parse(from) : end.minusMonths(12);
        List<Map<String, Object>> updates = new ArrayList<>();
        for (Object[] r : grads.updatesByMonth(start, end)) {
            Map<String, Object> m = new HashMap<>(); m.put("mes", String.valueOf(r[0])); m.put("updates", ((Number) r[1]).longValue()); updates.add(m);
        }
        List<Map<String, Object>> onboardings = new ArrayList<>();
        for (Object[] r : grads.onboardingsByMonth(start, end)) {
            Map<String, Object> m = new HashMap<>(); m.put("mes", String.valueOf(r[0])); m.put("onboardings", ((Number) r[1]).longValue()); onboardings.add(m);
        }
        return ResponseEntity.ok(Map.of("from", start, "to", end, "updates", updates, "onboardings", onboardings));
    }
}

