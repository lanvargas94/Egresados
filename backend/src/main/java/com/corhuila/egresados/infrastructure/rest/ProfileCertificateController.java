package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.GraduateRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@io.swagger.v3.oas.annotations.tags.Tag(name = "04. Perfil de Egresado", description = "Gestión completa del perfil personal y profesional del egresado, incluyendo historial de cambios")
public class ProfileCertificateController {
    private final GraduateRepository grads;
    public ProfileCertificateController(GraduateRepository grads) { this.grads = grads; }

    @GetMapping("/certificate")
    public ResponseEntity<byte[]> certificate(@RequestParam UUID graduateId) {
        var g = grads.findById(graduateId).orElseThrow();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, baos);
        doc.open();
        Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font body = FontFactory.getFont(FontFactory.HELVETICA, 12);
        doc.add(new Paragraph("Constancia de pertenencia – Egresados CORHUILA", title));
        doc.add(new Paragraph("\n"));
        doc.add(new Paragraph("Nombre: " + safe(g.getNombreLegal()), body));
        doc.add(new Paragraph("Identificación: " + safe(g.getIdentificacion()), body));
        String programa = g.getProgramas() != null && !g.getProgramas().isEmpty() ? g.getProgramas().get(0).getPrograma() : "";
        doc.add(new Paragraph("Programa: " + programa, body));
        doc.add(new Paragraph("Fecha: " + LocalDate.now(), body));
        doc.close();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=constancia-"+graduateId+".pdf");
        return ResponseEntity.ok().headers(headers).body(baos.toByteArray());
    }

    private String safe(Object v) { return v == null ? "" : String.valueOf(v); }
}

