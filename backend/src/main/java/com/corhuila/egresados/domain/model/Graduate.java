package com.corhuila.egresados.domain.model;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Graduate {
    private UUID id;
    private String idInterno; // provisto por Corhuilaplus
    private String identificacion;
    private String nombreLegal;
    private List<Program> programas = new ArrayList<>();

    // Contacto (Paso 1)
    private String correoPersonal;
    private String pais;
    private String ciudad;
    private String telefonoMovilE164;

    // Laboral (Paso 2)
    private EmploymentStatus situacionLaboral;
    private String industria;
    private String empresa;
    private String cargo;

    // Preferencias (Paso 3)
    private Boolean aporteMentoria;
    private Boolean aporteOfertas;
    private Boolean aporteConferencista;
    private Boolean intNoticiasFacultad;
    private Boolean intEventosCiudad;
    private Boolean intOfertasSector;
    private Boolean intPosgrados;

    // Email
    private boolean correoVerificado;

    // Preferencias y consentimiento (Paso 3)
    private boolean consentimientoDatos;
    private boolean onboardingCompleto;

    // Estado del egresado (para administrador)
    private GraduateStatus estado = GraduateStatus.ACTIVO;
    
    // Observaciones internas (solo para administradores)
    private String observacionesInternas;

    // Trazabilidad
    private OffsetDateTime creadoEn;
    private OffsetDateTime actualizadoEn;

    public Graduate() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getIdInterno() { return idInterno; }
    public void setIdInterno(String idInterno) { this.idInterno = idInterno; }

    public String getIdentificacion() { return identificacion; }
    public void setIdentificacion(String identificacion) { this.identificacion = identificacion; }

    public String getNombreLegal() { return nombreLegal; }
    public void setNombreLegal(String nombreLegal) { this.nombreLegal = nombreLegal; }

    public List<Program> getProgramas() { return programas; }
    public void setProgramas(List<Program> programas) { this.programas = programas; }

    public String getCorreoPersonal() { return correoPersonal; }
    public void setCorreoPersonal(String correoPersonal) { this.correoPersonal = correoPersonal; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getTelefonoMovilE164() { return telefonoMovilE164; }
    public void setTelefonoMovilE164(String telefonoMovilE164) { this.telefonoMovilE164 = telefonoMovilE164; }

    public EmploymentStatus getSituacionLaboral() { return situacionLaboral; }
    public void setSituacionLaboral(EmploymentStatus situacionLaboral) { this.situacionLaboral = situacionLaboral; }

    public String getIndustria() { return industria; }
    public void setIndustria(String industria) { this.industria = industria; }

    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }

    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public Boolean getAporteMentoria() { return aporteMentoria; }
    public void setAporteMentoria(Boolean aporteMentoria) { this.aporteMentoria = aporteMentoria; }
    public Boolean getAporteOfertas() { return aporteOfertas; }
    public void setAporteOfertas(Boolean aporteOfertas) { this.aporteOfertas = aporteOfertas; }
    public Boolean getAporteConferencista() { return aporteConferencista; }
    public void setAporteConferencista(Boolean aporteConferencista) { this.aporteConferencista = aporteConferencista; }
    public Boolean getIntNoticiasFacultad() { return intNoticiasFacultad; }
    public void setIntNoticiasFacultad(Boolean intNoticiasFacultad) { this.intNoticiasFacultad = intNoticiasFacultad; }
    public Boolean getIntEventosCiudad() { return intEventosCiudad; }
    public void setIntEventosCiudad(Boolean intEventosCiudad) { this.intEventosCiudad = intEventosCiudad; }
    public Boolean getIntOfertasSector() { return intOfertasSector; }
    public void setIntOfertasSector(Boolean intOfertasSector) { this.intOfertasSector = intOfertasSector; }
    public Boolean getIntPosgrados() { return intPosgrados; }
    public void setIntPosgrados(Boolean intPosgrados) { this.intPosgrados = intPosgrados; }

    public boolean isCorreoVerificado() { return correoVerificado; }
    public void setCorreoVerificado(boolean correoVerificado) { this.correoVerificado = correoVerificado; }

    public boolean isConsentimientoDatos() { return consentimientoDatos; }
    public void setConsentimientoDatos(boolean consentimientoDatos) { this.consentimientoDatos = consentimientoDatos; }

    public boolean isOnboardingCompleto() { return onboardingCompleto; }
    public void setOnboardingCompleto(boolean onboardingCompleto) { this.onboardingCompleto = onboardingCompleto; }

    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }

    public OffsetDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(OffsetDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }

    public GraduateStatus getEstado() { return estado; }
    public void setEstado(GraduateStatus estado) { this.estado = estado; }

    public String getObservacionesInternas() { return observacionesInternas; }
    public void setObservacionesInternas(String observacionesInternas) { this.observacionesInternas = observacionesInternas; }
}
