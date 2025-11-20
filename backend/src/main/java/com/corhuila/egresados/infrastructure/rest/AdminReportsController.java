package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.model.EmploymentStatus;
import com.corhuila.egresados.infrastructure.analytics.ExportLog;
import com.corhuila.egresados.infrastructure.analytics.ExportLogRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.GraduateEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportsController {
    private final SpringGraduateJpaRepository grads;
    private final ExportLogRepository logs;
    private final com.corhuila.egresados.application.admin.AdminReportsUseCase reportsUseCase;
    
    public AdminReportsController(
        SpringGraduateJpaRepository grads, 
        ExportLogRepository logs,
        com.corhuila.egresados.application.admin.AdminReportsUseCase reportsUseCase
    ) { 
        this.grads = grads; 
        this.logs = logs;
        this.reportsUseCase = reportsUseCase;
    }

    public record ExportRequest(@NotEmpty List<String> fields,
                                String facultad, String programa, Integer anio,
                                String pais, String ciudad, String sector, EmploymentStatus situacion,
                                String updatedFrom, String updatedTo,
                                String justification,
                                String format) {}

    @PostMapping("/export")
    public ResponseEntity<?> export(@RequestBody ExportRequest req, java.security.Principal principal) {
        OffsetDateTime from = req.updatedFrom() != null && !req.updatedFrom().isBlank() ? OffsetDateTime.parse(req.updatedFrom()) : null;
        OffsetDateTime to = req.updatedTo() != null && !req.updatedTo().isBlank() ? OffsetDateTime.parse(req.updatedTo()) : null;
        long count = grads.countFiltered(req.facultad(), req.programa(), req.anio(), req.pais(), req.ciudad(), req.sector(), req.situacion(), from, to);
        boolean hasFilter = (req.facultad()!=null && !req.facultad().isBlank()) || (req.programa()!=null && !req.programa().isBlank()) || req.anio()!=null ||
                (req.pais()!=null && !req.pais().isBlank()) || (req.ciudad()!=null && !req.ciudad().isBlank()) || (req.sector()!=null && !req.sector().isBlank()) || req.situacion()!=null || from!=null || to!=null;
        if (count > 5000 && !hasFilter && (req.justification()==null || req.justification().isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error","RN-RP01: Se requiere al menos 1 filtro o justificación para exportar más de 5.000 registros"));
        }

        List<GraduateEntity> list = grads.findFiltered(req.facultad(), req.programa(), req.anio(), req.pais(), req.ciudad(), req.sector(), req.situacion(), from, to);
        // Log RN-RP02
        ExportLog log = new ExportLog();
        log.setActor(principal != null ? principal.getName() : "admin");
        log.setCreatedAt(OffsetDateTime.now());
        log.setFilters(Map.of(
                "facultad", req.facultad(), "programa", req.programa(), "anio", req.anio(),
                "pais", req.pais(), "ciudad", req.ciudad(), "sector", req.sector(), "situacion", req.situacion(),
                "from", from, "to", to
        ).toString());
        log.setFields(String.join(",", req.fields()));
        log.setCount(list.size());
        log.setFormat(req.format()!=null? req.format() : "csv");
        logs.save(log);

        String format = req.format()!=null? req.format().toLowerCase() : "csv";
        if ("xlsx".equals(format)) {
            byte[] bytes = toXlsx(req.fields(), list);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export-egresados.xlsx");
            return ResponseEntity.ok().headers(headers).body(bytes);
        } else {
            String csv = toCsv(req.fields(), list);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=export-egresados.csv");
            return ResponseEntity.ok().headers(headers).body(csv);
        }
    }

    private String toCsv(List<String> fields, List<GraduateEntity> list) {
        List<String> allowed = List.of("identificacion","nombre","correo","pais","ciudad","telefono","situacion","industria","empresa","cargo","consentimiento","onboarding","actualizado","facultad","programa","anio");
        List<String> cols = fields.stream().filter(allowed::contains).collect(Collectors.toList());
        if (cols.isEmpty()) cols = List.of("identificacion","nombre","correo");
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", cols)).append("\n");
        for (GraduateEntity g : list) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("identificacion", nz(g.getIdentificacion()));
            row.put("nombre", nz(g.getNombreLegal()));
            row.put("correo", nz(g.getCorreoPersonal()));
            row.put("pais", nz(g.getPais()));
            row.put("ciudad", nz(g.getCiudad()));
            row.put("telefono", nz(g.getTelefonoMovilE164()));
            row.put("situacion", g.getSituacionLaboral() == null ? "" : g.getSituacionLaboral().name());
            row.put("industria", nz(g.getIndustria()));
            row.put("empresa", nz(g.getEmpresa()));
            row.put("cargo", nz(g.getCargo()));
            row.put("consentimiento", String.valueOf(g.isConsentimientoDatos()));
            row.put("onboarding", String.valueOf(g.isOnboardingCompleto()));
            row.put("actualizado", g.getActualizadoEn() == null ? "" : g.getActualizadoEn().toString());
            String fac = ""; String prog = ""; String anio = "";
            if (g.getProgramas() != null && !g.getProgramas().isEmpty()) {
                var p = g.getProgramas().get(0);
                fac = nz(p.getFacultad()); prog = nz(p.getPrograma()); anio = p.getAnio() == null ? "" : String.valueOf(p.getAnio());
            }
            row.put("facultad", fac); row.put("programa", prog); row.put("anio", anio);
            List<String> vals = new ArrayList<>();
            for (String c : cols) {
                vals.add(escape(row.getOrDefault(c, "")));
            }
            sb.append(String.join(",", vals)).append("\n");
        }
        return sb.toString();
    }

    private String nz(String s) { return s == null ? "" : s.replace(","," "); }
    private String escape(String s) { if (s.contains(",") || s.contains("\"")) { return '"' + s.replace("\"","\"\"") + '"'; } return s; }

    private byte[] toXlsx(List<String> fields, List<GraduateEntity> list) {
        try {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            org.apache.poi.ss.usermodel.Workbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
            org.apache.poi.ss.usermodel.Sheet sh = wb.createSheet("egresados");
            java.util.List<String> allowed = java.util.List.of("identificacion","nombre","correo","pais","ciudad","telefono","situacion","industria","empresa","cargo","consentimiento","onboarding","actualizado","facultad","programa","anio");
            java.util.List<String> cols = fields.stream().filter(allowed::contains).collect(java.util.stream.Collectors.toList());
            if (cols.isEmpty()) cols = java.util.List.of("identificacion","nombre","correo");
            int r = 0; org.apache.poi.ss.usermodel.Row header = sh.createRow(r++);
            for (int i=0;i<cols.size();i++){ header.createCell(i).setCellValue(cols.get(i)); }
            for (GraduateEntity g : list) {
                java.util.Map<String, String> row = new java.util.LinkedHashMap<>();
                row.put("identificacion", nz(g.getIdentificacion()));
                row.put("nombre", nz(g.getNombreLegal()));
                row.put("correo", nz(g.getCorreoPersonal()));
                row.put("pais", nz(g.getPais()));
                row.put("ciudad", nz(g.getCiudad()));
                row.put("telefono", nz(g.getTelefonoMovilE164()));
                row.put("situacion", g.getSituacionLaboral() == null ? "" : g.getSituacionLaboral().name());
                row.put("industria", nz(g.getIndustria()));
                row.put("empresa", nz(g.getEmpresa()));
                row.put("cargo", nz(g.getCargo()));
                row.put("consentimiento", String.valueOf(g.isConsentimientoDatos()));
                row.put("onboarding", String.valueOf(g.isOnboardingCompleto()));
                row.put("actualizado", g.getActualizadoEn() == null ? "" : g.getActualizadoEn().toString());
                String fac = ""; String prog = ""; String anio = "";
                if (g.getProgramas() != null && !g.getProgramas().isEmpty()) {
                    var p = g.getProgramas().get(0);
                    fac = nz(p.getFacultad()); prog = nz(p.getPrograma()); anio = p.getAnio() == null ? "" : String.valueOf(p.getAnio());
                }
                row.put("facultad", fac); row.put("programa", prog); row.put("anio", anio);
                org.apache.poi.ss.usermodel.Row rr = sh.createRow(r++);
                int c=0; for (String col : cols) { rr.createCell(c++).setCellValue(row.getOrDefault(col, "")); }
            }
            for (int i=0;i<Math.min(cols.size(), 20); i++){ sh.autoSizeColumn(i); }
            wb.write(baos); wb.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando XLSX", e);
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> logs(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        var pg = logs.findAllByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(page, size));
        return ResponseEntity.ok(java.util.Map.of("items", pg.getContent(), "total", pg.getTotalElements(), "page", page, "size", size));
    }

    @GetMapping("/graduates-by-program")
    public ResponseEntity<?> reportGraduatesByProgram() {
        try {
            var result = reportsUseCase.reportGraduatesByProgram();
            return ResponseEntity.ok(Map.of("items", result));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al generar reporte: " + ex.getMessage()));
        }
    }

    @GetMapping("/graduates-by-year")
    public ResponseEntity<?> reportGraduatesByYear() {
        try {
            var result = reportsUseCase.reportGraduatesByYear();
            return ResponseEntity.ok(Map.of("items", result));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al generar reporte: " + ex.getMessage()));
        }
    }

    @GetMapping("/graduates-by-status")
    public ResponseEntity<?> reportGraduatesByStatus() {
        try {
            var result = reportsUseCase.reportGraduatesByStatus();
            return ResponseEntity.ok(Map.of("items", result));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al generar reporte: " + ex.getMessage()));
        }
    }

    @GetMapping("/event-registrations")
    public ResponseEntity<?> reportEventRegistrations() {
        try {
            var result = reportsUseCase.reportEventRegistrations();
            return ResponseEntity.ok(Map.of("items", result));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al generar reporte: " + ex.getMessage()));
        }
    }
}
