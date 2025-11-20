package com.corhuila.egresados.application.admin;

import com.corhuila.egresados.domain.model.Banner;
import com.corhuila.egresados.domain.ports.BannerRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ManageBannerUseCase {
    public record CreateCommand(
        String titulo,
        String subtitulo,
        String imagenUrl,
        String enlaceAccion,
        Integer orden,
        boolean activo
    ) {}

    public record UpdateCommand(
        UUID id,
        String titulo,
        String subtitulo,
        String imagenUrl,
        String enlaceAccion,
        Integer orden,
        Boolean activo
    ) {}

    private final BannerRepository bannerRepository;

    public ManageBannerUseCase(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public Banner create(CreateCommand cmd) {
        Banner b = new Banner();
        b.setId(UUID.randomUUID());
        b.setTitulo(cmd.titulo());
        b.setSubtitulo(cmd.subtitulo());
        b.setImagenUrl(cmd.imagenUrl());
        b.setEnlaceAccion(cmd.enlaceAccion());
        b.setOrden(cmd.orden() != null ? cmd.orden() : 0);
        b.setActivo(cmd.activo());
        b.setCreadoEn(OffsetDateTime.now());
        b.setActualizadoEn(OffsetDateTime.now());
        return bannerRepository.save(b);
    }

    public Banner update(UpdateCommand cmd) {
        Banner b = bannerRepository.findById(cmd.id())
                .orElseThrow(() -> new IllegalArgumentException("Banner no encontrado"));
        
        if (cmd.titulo() != null) b.setTitulo(cmd.titulo());
        if (cmd.subtitulo() != null) b.setSubtitulo(cmd.subtitulo());
        if (cmd.imagenUrl() != null) b.setImagenUrl(cmd.imagenUrl());
        if (cmd.enlaceAccion() != null) b.setEnlaceAccion(cmd.enlaceAccion());
        if (cmd.orden() != null) b.setOrden(cmd.orden());
        if (cmd.activo() != null) b.setActivo(cmd.activo());
        
        b.setActualizadoEn(OffsetDateTime.now());
        return bannerRepository.save(b);
    }

    public List<Banner> listActivos() {
        return bannerRepository.findActivosOrderedByOrden();
    }

    public List<Banner> listAll() {
        return bannerRepository.findAll();
    }

    public void delete(UUID id) {
        bannerRepository.delete(id);
    }
}



