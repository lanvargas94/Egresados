package com.corhuila.egresados.application.admin;

import com.corhuila.egresados.domain.model.GraduateStatus;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventRsvpJpaRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AdminReportsUseCase {
    private final SpringGraduateJpaRepository graduateJpa;
    private final SpringEventJpaRepository eventJpa;
    private final SpringEventRsvpJpaRepository rsvpJpa;

    public AdminReportsUseCase(
        SpringGraduateJpaRepository graduateJpa,
        SpringEventJpaRepository eventJpa,
        SpringEventRsvpJpaRepository rsvpJpa
    ) {
        this.graduateJpa = graduateJpa;
        this.eventJpa = eventJpa;
        this.rsvpJpa = rsvpJpa;
    }

    // Conteo de egresados por programa
    public List<Map<String, Object>> reportGraduatesByProgram() {
        var results = graduateJpa.demografiaAggregate(null, null, null);
        return results.stream().map(row -> {
            Map<String, Object> item = new HashMap<>();
            item.put("programa", row[1]); // programa
            item.put("facultad", row[0]); // facultad
            item.put("anio", row[2]); // año
            item.put("total", row[3]); // total
            return item;
        }).collect(Collectors.toList());
    }

    // Conteo de egresados por año de graduación
    public List<Map<String, Object>> reportGraduatesByYear() {
        var results = graduateJpa.demografiaAggregate(null, null, null);
        Map<Integer, Long> byYear = results.stream()
            .collect(Collectors.groupingBy(
                row -> (Integer) row[2], // año
                Collectors.summingLong(row -> ((Number) row[3]).longValue())
            ));
        return byYear.entrySet().stream()
            .map(e -> {
                Map<String, Object> item = new HashMap<>();
                item.put("anio", e.getKey());
                item.put("total", e.getValue());
                return item;
            })
            .sorted((a, b) -> ((Integer) b.get("anio")).compareTo((Integer) a.get("anio")))
            .collect(Collectors.toList());
    }

    // Conteo de egresados activos/inactivos
    public List<Map<String, Object>> reportGraduatesByStatus() {
        Map<GraduateStatus, Long> byStatus = graduateJpa.findAll().stream()
            .collect(Collectors.groupingBy(
                g -> g.getEstado() != null ? g.getEstado() : GraduateStatus.ACTIVO,
                Collectors.counting()
            ));
        return byStatus.entrySet().stream()
            .map(e -> {
                Map<String, Object> item = new HashMap<>();
                item.put("estado", e.getKey().name());
                item.put("total", e.getValue());
                return item;
            })
            .collect(Collectors.toList());
    }

    // Conteo de inscritos por evento
    public List<Map<String, Object>> reportEventRegistrations() {
        return eventJpa.findAll().stream()
            .map(e -> {
                long count = rsvpJpa.countByEventId(e.getId());
                Map<String, Object> item = new HashMap<>();
                item.put("eventoId", e.getId());
                String nombre = e.getNombre();
                if (nombre == null || nombre.isBlank()) {
                    // Compatibilidad con campo antiguo
                    try {
                        java.lang.reflect.Method getTitulo = e.getClass().getMethod("getTitulo");
                        nombre = (String) getTitulo.invoke(e);
                    } catch (Exception ignored) {}
                }
                item.put("eventoNombre", nombre != null ? nombre : "Sin nombre");
                item.put("inscritos", count);
                return item;
            })
            .collect(Collectors.toList());
    }
}

