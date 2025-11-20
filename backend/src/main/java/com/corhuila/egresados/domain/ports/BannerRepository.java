package com.corhuila.egresados.domain.ports;

import com.corhuila.egresados.domain.model.Banner;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BannerRepository {
    Optional<Banner> findById(UUID id);
    List<Banner> findAll();
    List<Banner> findActivosOrderedByOrden();
    Banner save(Banner banner);
    void delete(UUID id);
}



