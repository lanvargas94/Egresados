package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.JobOfferRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/jobs")
public class JobPublicController {
    private final JobOfferRepository repo;
    public JobPublicController(JobOfferRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String sector,
                                  @RequestParam(required = false) String empresa,
                                  @RequestParam(name = "tipoContrato", required = false) String tipoContrato,
                                  @RequestParam(required = false) LocalDate fromDate,
                                  @RequestParam(required = false) LocalDate toDate,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(defaultValue = "asc") String sort) {
        return ResponseEntity.ok(repo.findPublicadas(LocalDate.now(), sector, empresa, tipoContrato, fromDate, toDate, page, size, sort));
    }
}
