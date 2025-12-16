package com.corhuila.egresados.domain.model;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AdminUser {
    public enum Role { ADMIN_GENERAL, ADMIN_PROGRAMA }

    private UUID id;
    private String username;
    private String password; // hasheado
    private String nombre;
    private String correo;
    private Role role;
    private List<String> programasAsignados; // solo para ADMIN_PROGRAMA
    private boolean activo = true;
    private OffsetDateTime creadoEn;
    private OffsetDateTime ultimoAcceso;

    public AdminUser() {
        this.programasAsignados = new ArrayList<>();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public List<String> getProgramasAsignados() { return programasAsignados; }
    public void setProgramasAsignados(List<String> programasAsignados) { this.programasAsignados = programasAsignados; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }

    public OffsetDateTime getUltimoAcceso() { return ultimoAcceso; }
    public void setUltimoAcceso(OffsetDateTime ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }
}






