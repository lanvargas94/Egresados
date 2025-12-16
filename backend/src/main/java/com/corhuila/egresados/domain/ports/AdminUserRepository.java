package com.corhuila.egresados.domain.ports;

import com.corhuila.egresados.domain.model.AdminUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminUserRepository {
    Optional<AdminUser> findById(UUID id);
    Optional<AdminUser> findByUsername(String username);
    List<AdminUser> findAll();
    AdminUser save(AdminUser adminUser);
    void delete(UUID id);
}






