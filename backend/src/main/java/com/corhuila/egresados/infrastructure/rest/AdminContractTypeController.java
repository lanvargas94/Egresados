package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.infrastructure.audit.AuditService;
import com.corhuila.egresados.infrastructure.catalog.entity.ContractTypeEntity;
import com.corhuila.egresados.infrastructure.catalog.repo.ContractTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/contract-types")
public class AdminContractTypeController {
    private final ContractTypeRepository repo; private final AuditService audit;
    public AdminContractTypeController(ContractTypeRepository repo, AuditService audit) { this.repo = repo; this.audit = audit; }

    @GetMapping
    public ResponseEntity<?> list() { return ResponseEntity.ok(repo.findAll()); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ContractTypeEntity e) { e.setId(null); e.setActive(true); var s = repo.save(e); audit.log("CREATE","ContractType", String.valueOf(s.getId()), s.getName()); return ResponseEntity.ok(s); }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ContractTypeEntity e) { e.setId(id); var s = repo.save(e); audit.log("UPDATE","ContractType", String.valueOf(s.getId()), s.getName()); return ResponseEntity.ok(s); }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) { var s = repo.findById(id).orElseThrow(); s.setActive(false); repo.save(s); audit.log("DEACTIVATE","ContractType", String.valueOf(s.getId()), s.getName()); return ResponseEntity.ok(java.util.Map.of("ok", true)); }
}

