package com.corhuila.egresados.infrastructure.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String from;
    private final String confirmUrlBase;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mailFrom}") String from,
                        @Value("${app.confirmUrl}") String confirmUrlBase) {
        this.mailSender = mailSender;
        this.from = from;
        this.confirmUrlBase = confirmUrlBase;
    }

    public void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            throw new RuntimeException("Error enviando correo: " + e.getMessage(), e);
        }
    }

    public void sendEmailConfirmation(String to, String token, String nombre) {
        String link = confirmUrlBase + token;
        String body = "<p>Hola " + (nombre == null ? "" : nombre) + ",</p>" +
                "<p>Confirma tu correo personal para la Plataforma de Egresados CORHUILA.</p>" +
                "<p><a href='" + link + "' style='background:#005bbb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;'>Confirmar correo</a></p>" +
                "<p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>" +
                "<p>" + link + "</p>" +
                "<p>Gracias.</p>";
        sendHtml(to, "Confirma tu correo – Egresados CORHUILA", body);
    }

    public void sendHtmlWithAttachments(String to, String subject, String html, 
                                       java.io.File attachment, java.io.File image) throws MessagingException {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        
        // Adjuntar documento si existe
        if (attachment != null && attachment.exists() && attachment.length() > 0) {
            FileSystemResource fileResource = new FileSystemResource(attachment);
            String attachmentName = attachment.getName();
            // Si el nombre tiene prefijos como "doc_", extraer el nombre original
            if (attachmentName.contains("_") && attachmentName.length() > 50) {
                // Intentar extraer el nombre original después del UUID
                int lastUnderscore = attachmentName.lastIndexOf('_');
                if (lastUnderscore > 0 && lastUnderscore < attachmentName.length() - 1) {
                    attachmentName = attachmentName.substring(lastUnderscore + 1);
                }
            }
            helper.addAttachment(attachmentName, fileResource);
            System.out.println("Documento adjuntado: " + attachmentName + " (" + attachment.length() + " bytes)");
        }
        
        // Adjuntar imagen como inline si existe
        if (image != null && image.exists() && image.length() > 0) {
            FileSystemResource imageResource = new FileSystemResource(image);
            // Usar "image" como Content-ID para que coincida con cid:image en el HTML
            helper.addInline("image", imageResource);
            System.out.println("Imagen adjuntada como inline: " + image.getName() + " (" + image.length() + " bytes)");
        }
        
        mailSender.send(msg);
    }
}

