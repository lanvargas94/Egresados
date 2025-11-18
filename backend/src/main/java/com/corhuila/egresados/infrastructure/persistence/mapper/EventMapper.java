package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.domain.model.EventRsvp;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventRsvpEntity;

public class EventMapper {
    public static Event toDomain(EventEntity e) {
        Event ev = new Event();
        ev.setId(e.getId());
        ev.setTitulo(e.getTitulo());
        ev.setFechaHora(e.getFechaHora());
        ev.setLugar(e.getLugar());
        ev.setEnlaceVirtual(e.getEnlaceVirtual());
        ev.setDescripcion(e.getDescripcion());
        ev.setCupos(e.getCupos());
        ev.setCancelacionHoras(e.getCancelacionHoras());
        ev.setEstado(e.getEstado());
        return ev;
    }

    public static void updateEntity(Event ev, EventEntity e) {
        e.setId(ev.getId());
        e.setTitulo(ev.getTitulo());
        e.setFechaHora(ev.getFechaHora());
        e.setLugar(ev.getLugar());
        e.setEnlaceVirtual(ev.getEnlaceVirtual());
        e.setDescripcion(ev.getDescripcion());
        e.setCupos(ev.getCupos());
        e.setCancelacionHoras(ev.getCancelacionHoras());
        e.setEstado(ev.getEstado());
    }

    public static EventRsvp toDomain(EventRsvpEntity e) {
        EventRsvp r = new EventRsvp();
        r.setId(e.getId());
        r.setEventId(e.getEventId());
        r.setGraduateId(e.getGraduateId());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }

    public static void updateEntity(EventRsvp r, EventRsvpEntity e) {
        e.setId(r.getId());
        e.setEventId(r.getEventId());
        e.setGraduateId(r.getGraduateId());
        e.setCreatedAt(r.getCreatedAt());
    }
}

