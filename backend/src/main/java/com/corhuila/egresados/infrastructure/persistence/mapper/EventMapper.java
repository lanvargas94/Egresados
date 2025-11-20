package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.domain.model.EventRsvp;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventRsvpEntity;

public class EventMapper {
    public static Event toDomain(EventEntity e) {
        Event ev = new Event();
        ev.setId(e.getId());
        ev.setNombre(e.getNombre() != null ? e.getNombre() : "Sin nombre");
        ev.setDescripcion(e.getDescripcion());
        ev.setFechaHoraInicio(e.getFechaHoraInicio());
        ev.setFechaHoraFin(e.getFechaHoraFin());
        ev.setTipoEvento(e.getTipoEvento() != null ? e.getTipoEvento() : Event.TipoEvento.PRESENCIAL);
        ev.setEnlaceConexion(e.getEnlaceConexion());
        ev.setLugarFisico(e.getLugarFisico());
        ev.setCapacidad(e.getCapacidad());
        ev.setEstado(e.getEstado());
        return ev;
    }

    public static void updateEntity(Event ev, EventEntity e) {
        e.setId(ev.getId());
        e.setNombre(ev.getNombre());
        e.setDescripcion(ev.getDescripcion());
        e.setFechaHoraInicio(ev.getFechaHoraInicio());
        e.setFechaHoraFin(ev.getFechaHoraFin());
        e.setTipoEvento(ev.getTipoEvento());
        e.setEnlaceConexion(ev.getEnlaceConexion());
        e.setLugarFisico(ev.getLugarFisico());
        e.setCapacidad(ev.getCapacidad());
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

