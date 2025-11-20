package com.corhuila.egresados.infrastructure.security;

import com.corhuila.egresados.domain.model.AdminUser;
import com.corhuila.egresados.domain.ports.AdminUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserDetailsService implements UserDetailsService {
    private final AdminUserRepository adminUserRepository;

    public AdminUserDetailsService(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (!adminUser.isActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        String role = adminUser.getRole() == AdminUser.Role.ADMIN_GENERAL ? "ADMIN_GENERAL" : "ADMIN_PROGRAMA";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

        // Actualizar último acceso
        try {
            adminUser.setUltimoAcceso(java.time.OffsetDateTime.now());
            adminUserRepository.save(adminUser);
        } catch (Exception ignored) {
            // Si falla la actualización, continuar
        }

        return User.builder()
                .username(adminUser.getUsername())
                .password(adminUser.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(!adminUser.isActivo())
                .credentialsExpired(false)
                .disabled(!adminUser.isActivo())
                .build();
    }
}



