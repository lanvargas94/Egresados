package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.AdminUser;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.AdminUserEntity;

import java.util.ArrayList;

public class AdminUserMapper {
    public static AdminUser toDomain(AdminUserEntity e) {
        if (e == null) return null;
        AdminUser u = new AdminUser();
        u.setId(e.getId());
        u.setUsername(e.getUsername());
        u.setPassword(e.getPassword());
        u.setNombre(e.getNombre());
        u.setCorreo(e.getCorreo());
        u.setRole(e.getRole());
        u.setProgramasAsignados(new ArrayList<>(e.getProgramasAsignados()));
        u.setActivo(e.isActivo());
        u.setCreadoEn(e.getCreadoEn());
        u.setUltimoAcceso(e.getUltimoAcceso());
        return u;
    }

    public static AdminUserEntity toEntity(AdminUser u) {
        if (u == null) return null;
        AdminUserEntity e = new AdminUserEntity();
        e.setId(u.getId());
        e.setUsername(u.getUsername());
        e.setPassword(u.getPassword());
        e.setNombre(u.getNombre());
        e.setCorreo(u.getCorreo());
        e.setRole(u.getRole());
        e.setProgramasAsignados(new ArrayList<>(u.getProgramasAsignados()));
        e.setActivo(u.isActivo());
        e.setCreadoEn(u.getCreadoEn());
        e.setUltimoAcceso(u.getUltimoAcceso());
        return e;
    }

    public static void updateEntity(AdminUser u, AdminUserEntity e) {
        e.setNombre(u.getNombre());
        e.setCorreo(u.getCorreo());
        e.setRole(u.getRole());
        e.setProgramasAsignados(new ArrayList<>(u.getProgramasAsignados()));
        e.setActivo(u.isActivo());
        e.setUltimoAcceso(u.getUltimoAcceso());
        // No actualizar username ni password directamente aquí
    }
}






