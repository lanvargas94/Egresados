package com.corhuila.egresados.infrastructure.config;

import com.corhuila.egresados.domain.model.AdminUser;
import com.corhuila.egresados.domain.ports.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {
    private final AdminUserRepository adminUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(AdminUserRepository adminUserRepository, BCryptPasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Crear o actualizar usuario admin.programa
        adminUserRepository.findByUsername("admin.programa").ifPresentOrElse(
            existing -> {
                // Actualizar contraseña si es necesario (regenerar hash)
                String newHash = passwordEncoder.encode("Programa123");
                if (!existing.getPassword().equals(newHash) && !passwordEncoder.matches("Programa123", existing.getPassword())) {
                    existing.setPassword(passwordEncoder.encode("Programa123"));
                    adminUserRepository.save(existing);
                    System.out.println("Usuario admin.programa: contraseña actualizada");
                } else {
                    System.out.println("Usuario admin.programa ya existe con contraseña correcta");
                }
            },
            () -> {
                // Crear usuario admin.programa con hash correcto
                AdminUser adminPrograma = new AdminUser();
                adminPrograma.setId(UUID.fromString("00000000-0000-0000-0000-000000000002"));
                adminPrograma.setUsername("admin.programa");
                adminPrograma.setPassword(passwordEncoder.encode("Programa123"));
                adminPrograma.setNombre("Admin Programa de Prueba");
                adminPrograma.setCorreo("admin.programa@corhuila.edu.co");
                adminPrograma.setRole(AdminUser.Role.ADMIN_PROGRAMA);
                adminPrograma.setProgramasAsignados(List.of("Ingeniería de Sistemas", "Ingeniería Industrial"));
                adminPrograma.setActivo(true);
                adminPrograma.setCreadoEn(OffsetDateTime.now());
                
                try {
                    adminUserRepository.save(adminPrograma);
                    System.out.println("Usuario admin.programa creado exitosamente");
                } catch (Exception e) {
                    System.err.println("Error al crear usuario admin.programa: " + e.getMessage());
                }
            }
        );

        // Asegurar que el usuario admin principal tenga el hash correcto
        adminUserRepository.findByUsername("admin").ifPresent(admin -> {
            // Verificar si el password es correcto, si no, actualizarlo
            if (!passwordEncoder.matches("Admin12345", admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode("Admin12345"));
                adminUserRepository.save(admin);
                System.out.println("Usuario admin: contraseña actualizada a Admin12345");
            } else {
                System.out.println("Usuario admin principal verificado con contraseña correcta");
            }
        });
    }
}

