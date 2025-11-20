package com.corhuila.egresados.infrastructure.persistence.adapter;

import com.corhuila.egresados.domain.model.AdminUser;
import com.corhuila.egresados.domain.ports.AdminUserRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.AdminUserEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringAdminUserJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.AdminUserMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class AdminUserRepositoryJpaAdapter implements AdminUserRepository {
    private final SpringAdminUserJpaRepository jpa;

    public AdminUserRepositoryJpaAdapter(SpringAdminUserJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<AdminUser> findById(UUID id) {
        return jpa.findById(id).map(AdminUserMapper::toDomain);
    }

    @Override
    public Optional<AdminUser> findByUsername(String username) {
        return jpa.findByUsername(username).map(AdminUserMapper::toDomain);
    }

    @Override
    public List<AdminUser> findAll() {
        return jpa.findAll().stream().map(AdminUserMapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public AdminUser save(AdminUser adminUser) {
        AdminUserEntity entity = adminUser.getId() != null && jpa.existsById(adminUser.getId())
                ? jpa.findById(adminUser.getId()).get()
                : new AdminUserEntity();
        if (adminUser.getId() != null && entity.getId() == null) {
            entity.setId(adminUser.getId());
        }
        if (entity.getId() == null) {
            entity.setId(UUID.randomUUID());
        }
        entity.setUsername(adminUser.getUsername());
        entity.setPassword(adminUser.getPassword());
        AdminUserMapper.updateEntity(adminUser, entity);
        if (entity.getCreadoEn() == null) {
            entity.setCreadoEn(java.time.OffsetDateTime.now());
        }
        AdminUserEntity saved = jpa.save(entity);
        return AdminUserMapper.toDomain(saved);
    }

    @Override
    public void delete(UUID id) {
        jpa.deleteById(id);
    }
}



