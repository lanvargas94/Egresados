package com.corhuila.egresados.application.admin;

import com.corhuila.egresados.domain.model.AdminUser;
import com.corhuila.egresados.domain.ports.AdminUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ManageAdminUserUseCase {
    public record CreateCommand(
        String username,
        String password,
        String nombre,
        String correo,
        AdminUser.Role role,
        List<String> programasAsignados
    ) {}

    public record UpdateCommand(
        UUID id,
        String nombre,
        String correo,
        AdminUser.Role role,
        List<String> programasAsignados,
        Boolean activo,
        String newPassword
    ) {}

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public ManageAdminUserUseCase(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminUser create(CreateCommand cmd) {
        if (adminUserRepository.findByUsername(cmd.username()).isPresent()) {
            throw new IllegalArgumentException("El usuario ya existe");
        }

        if (cmd.role() == AdminUser.Role.ADMIN_PROGRAMA && 
            (cmd.programasAsignados() == null || cmd.programasAsignados().isEmpty())) {
            throw new IllegalArgumentException("ADMIN_PROGRAMA debe tener al menos un programa asignado");
        }

        AdminUser u = new AdminUser();
        u.setId(UUID.randomUUID());
        u.setUsername(cmd.username());
        u.setPassword(passwordEncoder.encode(cmd.password()));
        u.setNombre(cmd.nombre());
        u.setCorreo(cmd.correo());
        u.setRole(cmd.role());
        if (cmd.programasAsignados() != null) {
            u.setProgramasAsignados(cmd.programasAsignados());
        }
        u.setActivo(true);
        u.setCreadoEn(OffsetDateTime.now());
        return adminUserRepository.save(u);
    }

    public AdminUser update(UpdateCommand cmd) {
        AdminUser u = adminUserRepository.findById(cmd.id())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (cmd.nombre() != null) u.setNombre(cmd.nombre());
        if (cmd.correo() != null) u.setCorreo(cmd.correo());
        if (cmd.role() != null) {
            if (cmd.role() == AdminUser.Role.ADMIN_PROGRAMA && 
                (cmd.programasAsignados() == null || cmd.programasAsignados().isEmpty())) {
                throw new IllegalArgumentException("ADMIN_PROGRAMA debe tener al menos un programa asignado");
            }
            u.setRole(cmd.role());
        }
        if (cmd.programasAsignados() != null) {
            u.setProgramasAsignados(cmd.programasAsignados());
        }
        if (cmd.activo() != null) u.setActivo(cmd.activo());
        if (cmd.newPassword() != null && !cmd.newPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(cmd.newPassword()));
        }

        return adminUserRepository.save(u);
    }

    public List<AdminUser> listAll() {
        return adminUserRepository.findAll();
    }

    public AdminUser getById(UUID id) {
        return adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    public void updateLastAccess(UUID id) {
        AdminUser u = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        u.setUltimoAcceso(OffsetDateTime.now());
        adminUserRepository.save(u);
    }

    // No se permite eliminar físico, solo desactivar
    public AdminUser deactivate(UUID id) {
        AdminUser u = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        u.setActivo(false);
        return adminUserRepository.save(u);
    }
}



