package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.NewsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final NewsRepository newsRepository;

    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String facultad,
                                  @RequestParam(required = false) String programa) {
        return ResponseEntity.ok(newsRepository.findPublicadasVigentes(OffsetDateTime.now(), facultad, programa, page, size));
    }
}
