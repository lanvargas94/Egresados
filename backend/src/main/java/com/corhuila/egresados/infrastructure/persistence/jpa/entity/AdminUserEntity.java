package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import com.corhuila.egresados.domain.model.AdminUser;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "admin_users", indexes = {
    @Index(name = "ux_admin_users_username", columnList = "username", unique = true)
})
public class AdminUserEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(nullable = false)
    private String password; // hasheado
    private String nombre;
    private String correo;
    @Enumerated(EnumType.STRING)
    private AdminUser.Role role;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "admin_user_programas", joinColumns = @JoinColumn(name = "admin_user_id"))
    @Column(name = "programa")
    private List<String> programasAsignados = new ArrayList<>();
    private boolean activo = true;
    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;
    @Column(name = "ultimo_acceso")
    private OffsetDateTime ultimoAcceso;

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

    public AdminUser.Role getRole() { return role; }
    public void setRole(AdminUser.Role role) { this.role = role; }

    public List<String> getProgramasAsignados() { return programasAsignados; }
    public void setProgramasAsignados(List<String> programasAsignados) { this.programasAsignados = programasAsignados; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }

    public OffsetDateTime getUltimoAcceso() { return ultimoAcceso; }
    public void setUltimoAcceso(OffsetDateTime ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }
}

