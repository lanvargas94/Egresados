package com.corhuila.egresados.infrastructure.persistence.adapter;

import com.corhuila.egresados.domain.model.Banner;
import com.corhuila.egresados.domain.ports.BannerRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.BannerEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringBannerJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.BannerMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class BannerRepositoryJpaAdapter implements BannerRepository {
    private final SpringBannerJpaRepository jpa;

    public BannerRepositoryJpaAdapter(SpringBannerJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<Banner> findById(UUID id) {
        return jpa.findById(id).map(BannerMapper::toDomain);
    }

    @Override
    public List<Banner> findAll() {
        return jpa.findAll().stream().map(BannerMapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Banner> findActivosOrderedByOrden() {
        return jpa.findByActivoTrueOrderByOrdenAsc().stream()
                .map(BannerMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Banner save(Banner banner) {
        BannerEntity entity = banner.getId() != null && jpa.existsById(banner.getId())
                ? jpa.findById(banner.getId()).get()
                : new BannerEntity();
        if (banner.getId() != null && entity.getId() == null) {
            entity.setId(banner.getId());
        }
        BannerMapper.updateEntity(banner, entity);
        if (entity.getCreadoEn() == null) {
            entity.setCreadoEn(java.time.OffsetDateTime.now());
        }
        entity.setActualizadoEn(java.time.OffsetDateTime.now());
        BannerEntity saved = jpa.save(entity);
        return BannerMapper.toDomain(saved);
    }

    @Override
    public void delete(UUID id) {
        jpa.deleteById(id);
    }
}



